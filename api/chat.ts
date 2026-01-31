import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

/** Vercel serverless handler types (compatible with @vercel/node) */
type VercelRequest = { method?: string; body?: unknown };
type VercelResponse = {
  status: (code: number) => VercelResponse;
  setHeader: (name: string, value: string) => VercelResponse;
  json: (body: unknown) => void;
};

type Message = { role: "user" | "assistant"; content: string };

type Intent =
  | "LIST_CASE_STUDIES"
  | "JOURNEY"
  | "CONTACT"
  | "CASE_STUDY_QA"
  | "GENERAL_QA";

type Pill = { label: string; url: string };

type CaseStudy = {
  case_study_id: string;
  title: string;
  url?: string | null;
  github?: string | null;
};

interface RagChunk {
  id: string | number;
  source: string;
  section: string | null;
  content: string;
  metadata: Record<string, unknown> | null;
  similarity: number;
}

interface ApiResponse {
  answer_md: string;
  pills: Pill[];
  sources?: Array<{ source: string; section: string | null; similarity: number }>;
  debug?: { intent: Intent; retrieved?: number };
  reply: string;
}

function isMessage(m: unknown): m is Message {
  if (typeof m !== "object" || m === null) return false;
  const x = m as Record<string, unknown>;
  if (x.role !== "user" && x.role !== "assistant") return false;
  return typeof x.content === "string";
}

function parseMessages(body: unknown): Message[] | null {
  if (typeof body !== "object" || body === null) return null;
  const m = (body as Record<string, unknown>).messages;
  if (!Array.isArray(m)) return null;
  for (const item of m) if (!isMessage(item)) return null;
  return m as Message[];
}

function safeJsonParse(body: unknown): unknown {
  try {
    return typeof body === "string" ? JSON.parse(body) : body ?? null;
  } catch {
    return null;
  }
}

function lastUserQuestion(messages: Message[]): string {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  return lastUser?.content?.trim() ?? "";
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^\w\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function stripMarkdownLinksAndUrls(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\bhttps?:\/\/[^\s)]+/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// ─────────────────────────────────────────────────────────────
// Deterministic pills
// ─────────────────────────────────────────────────────────────

const TIMELINE_PILL: Pill = { label: "Timeline", url: "/about" };

// ⚠️ Update these to YOUR real destinations
const CONTACT_PILLS: Pill[] = [
  // Replace the email + links with your real ones
  { label: "Email", url: "mailto:aurelia.azarmi@gmail.com" },
  { label: "LinkedIn", url: "https://www.linkedin.com/in/aurelia-azarmi/" },
  // Optional
  { label: "GitHub", url: "https://github.com/justaurelia" },
  // { label: "Book a call", url: "https://cal.com/your-handle" },
];

function caseStudyToPills(cs: CaseStudy): Pill[] {
  const pills: Pill[] = [];
  const title = cs.title || "Case study";
  if (cs.url) pills.push({ label: title, url: cs.url });
  if (cs.github) pills.push({ label: title, url: cs.github }); // UI shows "GitHub · {label}"
  return pills;
}

// ─────────────────────────────────────────────────────────────
// Router (cheap heuristics first; no LLM)
// ─────────────────────────────────────────────────────────────

function detectIntent(questionRaw: string): Intent {
  const q = normalize(questionRaw);

  const wantsList =
    /\b(list|show|all)\b/.test(q) &&
    /\b(case study|case studies|projects|work)\b/.test(q);

  if (wantsList && /\b(case study|case studies)\b/.test(q)) return "LIST_CASE_STUDIES";

  const journey =
    /\b(journey|timeline|experience|experiences|work history|career|resume|roles|jobs|background|first job|previous job|past job|employment)\b/.test(
      q
    );
  if (journey) return "JOURNEY";

  // if user explicitly asks about a case study or "what is X" and likely a project name
  const caseStudyAsk =
    /\b(case study|case-study|project|startup|product)\b/.test(q) ||
    /^(what is|tell me about|tell me more about|explain)\b/.test(q);
  if (caseStudyAsk) return "CASE_STUDY_QA";

  // Check contact last to avoid false positives (e.g., "email" in case study titles)
  const contact =
    /\b(contact|reach|email|linkedin|connect|calendar|call|meeting|book)\b/.test(q);
  if (contact) return "CONTACT";

  return "GENERAL_QA";
}

// ─────────────────────────────────────────────────────────────
// Supabase helpers
// ─────────────────────────────────────────────────────────────

async function listCaseStudies(supabase: ReturnType<typeof createClient>): Promise<CaseStudy[]> {
  // Prefer RPC if you created it (fast + deterministic)
  const rpc = await supabase.rpc("list_case_studies");
  if (!rpc.error && Array.isArray(rpc.data)) {
    console.log("[listCaseStudies] RPC returned:", rpc.data.length, "rows");
    return rpc.data
      .map((r: any) => ({
        case_study_id: String(r.case_study_id ?? "").trim(),
        title: String(r.title ?? "").trim(),
        url: r.url ? String(r.url) : null,
        github: r.github ? String(r.github) : null,
      }))
      .filter((x: CaseStudy) => x.case_study_id && x.title);
  }

  console.log("[listCaseStudies] RPC failed or not available, using fallback. Error:", rpc.error);

  // Fallback: pull metadata rows and dedupe in code
  // NOTE: This can be slower if you have many chunks, but works to ship.
  const { data, error } = await supabase
    .from("rag_chunks")
    .select("metadata,source")
    .filter("metadata->>type", "eq", "case-study")
    .limit(5000);

  if (error) {
    console.error("[listCaseStudies] Fallback query error:", error);
    throw error;
  }

  console.log("[listCaseStudies] Fallback query returned:", data?.length ?? 0, "rows");

  const map = new Map<string, CaseStudy>();
  for (const row of data ?? []) {
    const meta = (row as any).metadata as Record<string, unknown> | null;
    if (!meta) {
      console.log("[listCaseStudies] Row has no metadata, skipping");
      continue;
    }
    const id =
      (typeof meta.case_study_id === "string" ? meta.case_study_id.trim() : null) ??
      (typeof meta.slug === "string" ? meta.slug.trim() : null) ??
      "";
    const title = typeof meta.title === "string" ? meta.title.trim() : "";
    const url = typeof meta.url === "string" ? meta.url.trim() : null;
    const github = typeof meta.github === "string" ? meta.github.trim() : null;
    
    console.log("[listCaseStudies] Processing row:", { id, title, url, github, meta_type: meta.type });
    
    if (!id || !title) {
      console.log("[listCaseStudies] Skipping row (missing id or title):", { id, title });
      continue;
    }
    if (!map.has(id)) map.set(id, { case_study_id: id, title, url, github });
  }
  
  const result = [...map.values()].sort((a, b) => a.title.localeCompare(b.title));
  console.log("[listCaseStudies] Final result:", result.length, "case studies:", result.map(cs => cs.case_study_id));
  return result;
}

function buildContext(chunks: RagChunk[]): string {
  if (!chunks.length) return "No relevant sources found.";
  return chunks
    .map((c, i) => {
      const src = `${c.source}${c.section ? ` | ${c.section}` : ""}`;
      return `SOURCE ${i + 1}: ${src}\n${c.content}`;
    })
    .join("\n\n---\n\n");
}

function extractCaseStudyMetaFromChunks(chunks: RagChunk[]): Map<string, CaseStudy> {
  const map = new Map<string, CaseStudy>();
  for (const c of chunks) {
    const meta = (c.metadata ?? {}) as Record<string, unknown>;
    const t = meta.type;
    if (t !== "case-study") continue;

    const id =
      (typeof meta.case_study_id === "string" ? meta.case_study_id.trim() : null) ??
      (typeof meta.slug === "string" ? meta.slug.trim() : null) ??
      "";
    const title = typeof meta.title === "string" ? meta.title.trim() : "";
    const url = typeof meta.url === "string" ? meta.url.trim() : null;
    const github = typeof meta.github === "string" ? meta.github.trim() : null;

    if (!id || !title) continue;
    if (!map.has(id)) map.set(id, { case_study_id: id, title, url, github });
  }
  return map;
}

// ─────────────────────────────────────────────────────────────
// OpenAI helpers
// ─────────────────────────────────────────────────────────────

async function embedQuestion(openai: OpenAI, question: string): Promise<number[]> {
  const emb = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: question,
    encoding_format: "float",
  });
  return emb.data[0].embedding as number[];
}

async function retrieveChunks(
  supabase: ReturnType<typeof createClient>,
  query_embedding: number[],
  match_count: number
): Promise<RagChunk[]> {
  const { data, error } = await supabase.rpc("match_rag_chunks", {
    query_embedding,
    match_count,
  });
  if (error) throw error;
  return (data ?? []) as RagChunk[];
}

async function llmAnswerWithRefs(args: {
  openai: OpenAI;
  question: string;
  context: string;
  // if present, constrain refs to known ids for better precision
  knownCaseStudyIds?: string[];
}): Promise<{ answer_md: string; referenced_case_study_ids: string[] }> {
  const { openai, question, context, knownCaseStudyIds } = args;

  const allowed =
    knownCaseStudyIds && knownCaseStudyIds.length
      ? `Allowed case_study_ids: ${knownCaseStudyIds.join(", ")}`
      : `Allowed case_study_ids: (use only ids that appear in SOURCES metadata; otherwise return []).`;

  const system = `You ARE Aurélia Azarmi. This is your personal portfolio website and you're chatting directly with a visitor.

Voice & tone:
- Talk like a real person having a casual conversation, not like a resume or formal document.
- Use "I" naturally: "I started at...", "That's where I learned...", "I really enjoyed..."
- Be warm and personable — share brief personal reflections, not just facts.
- Avoid bullet-point lists for simple questions. Use flowing sentences instead.
- Keep it short and genuine — 2-3 sentences is often enough.

Examples of good tone:
- "My first job was at Sopra Banking Software back in 2008. I worked on payment systems and customer service projects — that's where I really learned the foundations of software engineering and developed a lot of empathy for end users."
- "I'm currently building Jucosa, an AI-powered tool for bakeries. It's been quite a journey getting here!"

Examples of bad tone (too formal/robotic):
- "2008–2012: Software Engineer at Sopra Banking Software — Worked on payment engine projects."
- "Here is a timeline of my career:"

Rules:
- Use ONLY the provided SOURCES for facts about your background, projects, and experience.
- If the answer isn't in SOURCES, say you don't have that information handy and suggest what else you can help with.
- Do NOT format answers as timelines or resume-style lists unless specifically asked for a list.
- Do NOT include any URLs in the answer — the UI adds links separately.
- Do NOT mention internal filenames like "SOURCE 1".
- Return STRICT JSON only.

Output JSON schema:
{
  "answer_md": string,
  "referenced_case_study_ids": string[]
}

referenced_case_study_ids rules:
- ONLY include IDs from the allowed list below. Do NOT invent IDs or use source filenames.
- If the answer doesn't reference any case study from the allowed list, return an empty array [].
- ${allowed}

Citations:
- Do NOT include source references like "(Case study: id)" in the answer_md. The UI will show relevant links separately.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.2,
    messages: [
      { role: "system", content: system },
      { role: "system", content: `SOURCES:\n\n${context}` },
      { role: "user", content: question },
    ],
  });

  const raw = completion.choices[0]?.message?.content?.trim() ?? "";
  // Parse strict JSON; fallback if model slips
  try {
    const parsed = JSON.parse(raw) as any;
    const answer_md = typeof parsed.answer_md === "string" ? parsed.answer_md.trim() : "";
    const referenced_case_study_ids = Array.isArray(parsed.referenced_case_study_ids)
      ? parsed.referenced_case_study_ids.map((x: any) => String(x).trim()).filter(Boolean)
      : [];
    return { answer_md, referenced_case_study_ids };
  } catch {
    // Fallback: treat as plain text, no refs
    return { answer_md: stripMarkdownLinksAndUrls(raw) || "Sorry — I couldn’t format that response.", referenced_case_study_ids: [] };
  }
}

// ─────────────────────────────────────────────────────────────
// Handler
// ─────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).setHeader("Allow", "POST").json({ error: "Method not allowed" });
    return;
  }

  const body = safeJsonParse(req.body);
  const messages = parseMessages(body);
  if (!messages) {
    res.status(400).json({ error: "Missing or invalid messages" });
    return;
  }

  const question = lastUserQuestion(messages);
  if (!question) {
    res.status(400).json({
      reply: "I didn't catch your question. Could you type something?",
      answer_md: "I didn't catch your question. Could you type something?",
      pills: [],
    } satisfies ApiResponse);
    return;
  }

  const { OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[chat] Missing env vars");
    res.status(500).json({ error: "Server configuration error" });
    return;
  }

  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const intent = detectIntent(question);

  try {
    // ── CONTACT (deterministic)
    if (intent === "CONTACT") {
      const answer_md =
        "Happy to continue the conversation — pick what’s easiest below.";
      const response: ApiResponse = {
        answer_md,
        pills: CONTACT_PILLS,
        reply: answer_md,
        debug: { intent },
      };
      res.status(200).json(response);
      return;
    }

    // ── LIST CASE STUDIES (deterministic list + pills)
    if (intent === "LIST_CASE_STUDIES") {
      const studies = await listCaseStudies(supabase);

      if (!studies.length) {
        const answer_md =
          "I don’t see any case studies indexed yet. Try again after ingestion, or ask me about a specific project.";
        res.status(200).json({
          answer_md,
          pills: [],
          reply: answer_md,
          debug: { intent },
        } satisfies ApiResponse);
        return;
      }

      const listMd =
        `## Case studies\n\n` +
        studies.map((s) => `- **${s.title}**`).join("\n");

      // Pill per case study: clicking sends "Tell me more about [title]" to chat
      const pills: Pill[] = [];
      for (const s of studies) {
        const title = s.title || "Case study";
        pills.push({
          label: `Tell me more about ${title}`,
          url: `prompt:Tell me more about ${title}`,
        });
      }

      const response: ApiResponse = {
        answer_md: listMd,
        pills,
        reply: listMd,
        debug: { intent, retrieved: studies.length },
      };
      res.status(200).json(response);
      return;
    }

    // ── JOURNEY (timeline pill always + RAG for details)
    if (intent === "JOURNEY") {
      const query_embedding = await embedQuestion(openai, question);

      // Pull more chunks to avoid "missing experiences"
      const chunks = await retrieveChunks(supabase, query_embedding, 18);

      const context = buildContext(chunks);
      const knownIds = [...extractCaseStudyMetaFromChunks(chunks).keys()];

      const { answer_md } = await llmAnswerWithRefs({
        openai,
        question:
          question +
          "\n\nPlease respond as a clean timeline if the user asked to list experiences (years + role + org + 1-line impact).",
        context,
        knownCaseStudyIds: knownIds,
      });

      const clean = stripMarkdownLinksAndUrls(answer_md);

      const response: ApiResponse = {
        answer_md: clean,
        pills: [TIMELINE_PILL],
        sources: chunks.map((c) => ({ source: c.source, section: c.section, similarity: c.similarity })),
        reply: clean,
        debug: { intent, retrieved: chunks.length },
      };
      res.status(200).json(response);
      return;
    }

    // ── CASE STUDY QA / GENERAL QA (vector + structured output + deterministic pills)
    {
      const query_embedding = await embedQuestion(openai, question);

      // Pull more chunks; we’ll dedupe pills by id
      const chunks = await retrieveChunks(supabase, query_embedding, 15);
      const context = buildContext(chunks);

      const caseStudyMap = extractCaseStudyMetaFromChunks(chunks);
      const knownIds = [...caseStudyMap.keys()];

      const { answer_md, referenced_case_study_ids } = await llmAnswerWithRefs({
        openai,
        question,
        context,
        knownCaseStudyIds: knownIds,
      });

      const clean = stripMarkdownLinksAndUrls(answer_md);

      // Build pills only from valid referenced case study IDs
      const pills: Pill[] = [];
      const used = new Set<string>();

      // Get valid case studies from referenced IDs
      const validCaseStudies: CaseStudy[] = [];
      for (const id of referenced_case_study_ids) {
        const cs = caseStudyMap.get(id);
        if (cs) validCaseStudies.push(cs);
      }

      // If more than 1 case study, use "Tell me more about..." prompts instead of URLs
      if (validCaseStudies.length > 1) {
        for (const cs of validCaseStudies) {
          const title = cs.title || "Case study";
          const promptUrl = `prompt:Tell me more about ${title}`;
          if (used.has(promptUrl)) continue;
          used.add(promptUrl);
          pills.push({ label: `Tell me more about ${title}`, url: promptUrl });
        }
      } else {
        // Single case study: show direct URL pills
        for (const cs of validCaseStudies) {
          for (const p of caseStudyToPills(cs)) {
            if (used.has(p.url)) continue;
            used.add(p.url);
            pills.push(p);
          }
        }
      }

      // If timeline/experience chunks were used, add timeline pill
      const usedTimelineChunks = chunks.some((c) =>
        /timeline|experience/i.test(c.source)
      );
      if (usedTimelineChunks && !used.has(TIMELINE_PILL.url)) {
        pills.push(TIMELINE_PILL);
      }

      const response: ApiResponse = {
        answer_md: clean,
        pills,
        sources: chunks.map((c) => ({ source: c.source, section: c.section, similarity: c.similarity })),
        reply: clean,
        debug: { intent, retrieved: chunks.length },
      };

      res.status(200).json(response);
      return;
    }
  } catch (err) {
    console.error("[chat] error:", err);
    res.status(500).json({
      reply: "Oups — something broke on my side. Try again in a moment.",
      answer_md: "Oups — something broke on my side. Try again in a moment.",
      pills: [],
    } satisfies ApiResponse);
  }
}
