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

interface RagChunk {
  id: string;
  source: string;
  section: string | null;
  content: string;
  metadata: Record<string, unknown> | null;
  similarity: number;
}

/** Derive title/url from source path only when RAG metadata has none (e.g. legacy chunks). */
function fallbackTitleAndUrl(
  source: string,
  type: "case-study" | "timeline"
): { title: string; url: string } | null {
  if (type === "timeline" && source === "08_timeline.md") {
    return { title: "My journey", url: "/about" };
  }
  if (type === "case-study" && source.startsWith("02_case-studies/")) {
    const name = source.replace("02_case-studies/", "").replace(/\.md$/i, "");
    if (!name) return null;
    const title = name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, " $1").trim();
    return { title, url: `/case-studies/${name}` };
  }
  return null;
}

interface BestSource {
  title: string;
  url: string;
  type: "case-study" | "timeline" | "github" | "contact";
}

interface ChatResponse {
  reply: string;
  sources: Array<{ source: string; section: string | null; similarity: number }>;
  bestSources?: BestSource[];
}

// ─────────────────────────────────────────────────────────────
// Hardcoded direct links for specific products (always show when user asks about them)
// ─────────────────────────────────────────────────────────────

const DIRECT_PRODUCT_PILLS: Record<string, BestSource> = {
  jucosa: { title: "Jucosa", url: "https://www.jucosa.io/", type: "case-study" },
  livelivelove: { title: "LiveLiveLove", url: "https://livelive.love/", type: "case-study" },
};

/** Detect if question is specifically about Jucosa or LiveLiveLove (e.g. "what is jucosa", "tell me about LiveLiveLove"). */
function getDirectProductFromQuestion(question: string): BestSource | null {
  const trimmed = question.trim().toLowerCase();
  const noSpaces = trimmed.replace(/\s+/g, "");
  if (noSpaces.includes("jucosa")) return DIRECT_PRODUCT_PILLS.jucosa;
  if (noSpaces.includes("livelivelove") || trimmed.includes("live live love")) return DIRECT_PRODUCT_PILLS.livelivelove;
  return null;
}

// ─────────────────────────────────────────────────────────────
// Validation helpers
// ─────────────────────────────────────────────────────────────

function isMessage(m: unknown): m is Message {
  if (typeof m !== "object" || m === null) return false;
  const x = m as Record<string, unknown>;
  if (typeof x.role !== "string" || typeof x.content !== "string") return false;
  if (x.role !== "user" && x.role !== "assistant") return false;
  return true;
}

function parseMessages(body: unknown): Message[] | null {
  if (typeof body !== "object" || body === null) return null;
  const m = (body as Record<string, unknown>).messages;
  if (!Array.isArray(m)) return null;
  for (const item of m) {
    if (!isMessage(item)) return null;
  }
  return m as Message[];
}

// ─────────────────────────────────────────────────────────────
// Short timeline (deterministic, no RAG)
// ─────────────────────────────────────────────────────────────

const SHORT_TIMELINE = `Here’s the short version:

• **2008–2014** — Customer service and product roles; foundations in engineering and cross-functional work.

• **2014–2020** — Pre-sales, then certified pastry chef while still in tech.

• **2021** — Moved to the US, launched an online pastry shop and partnerships.

• **2023** — Resold the bakery to focus full-time on Jucosa and AI/cloud.

• **2024–2025** — Building and launching the AI-powered bakery management platform.`;

const AFFIRMATIVE_PATTERN =
  /^(yes|yeah|yep|ok|okay|sure|show|go on|go|please|yup|absolutely|sounds good|let's go|do it|give me)\s*[.!?]*$/i;

function lastAssistantMessage(messages: Message[]): string {
  const last = [...messages].reverse().find((m) => m.role === "assistant");
  return last?.content?.trim() ?? "";
}

function offeredShortTimeline(assistantContent: string): boolean {
  return /want the short timeline\?/i.test(assistantContent);
}

/** True if the assistant message contains an offer (e.g. "do you want", "want me to", "shall I"). */
function offeredSomething(assistantContent: string): boolean {
  if (!assistantContent.trim()) return false;
  return /(do you want|want me to|shall I|want the|would you like|can I (send|give|point)|I can (send|give|point))/i.test(
    assistantContent
  );
}

/** Content of the user message before the last one (for "yes" follow-up context). */
function previousUserMessage(messages: Message[]): string | null {
  const userMessages = messages.filter((m) => m.role === "user");
  if (userMessages.length < 2) return null;
  return userMessages[userMessages.length - 2].content.trim() || null;
}

function isAffirmative(userContent: string): boolean {
  const trimmed = userContent.trim();
  return trimmed.length > 0 && AFFIRMATIVE_PATTERN.test(trimmed);
}

// ─────────────────────────────────────────────────────────────
// Query intents: definition, list case studies
// ─────────────────────────────────────────────────────────────

const DEFINITION_INTENT_PATTERN = /^(what is|define|explain)\s+/i;
const LIST_CASE_STUDIES_PATTERN =
  /(what are your case stud(y|ies)|list (your )?case stud(y|ies)|show (me )?your case stud(y|ies)|(your |all )?case stud(y|ies)\s*(\?|$))/i;

function parseDefinitionIntent(question: string): { definitionIntent: boolean; entity: string } {
  const trimmed = question.trim();
  const definitionIntent = DEFINITION_INTENT_PATTERN.test(trimmed);
  const remainder = definitionIntent
    ? trimmed.replace(DEFINITION_INTENT_PATTERN, "").trim()
    : trimmed;
  const entity = remainder
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return { definitionIntent, entity };
}

function isListCaseStudiesIntent(question: string): boolean {
  return LIST_CASE_STUDIES_PATTERN.test(question.trim());
}

const GITHUB_INTENT_PATTERN = /\b(github|code|demo|repo|repository|source code)\b/i;

function isGitHubIntent(question: string): boolean {
  return GITHUB_INTENT_PATTERN.test(question.trim());
}

/** Contact / personal info: email, phone, address, linkedin, how to reach, contact. */
const CONTACT_INTENT_PATTERN =
  /\b(email|phone|number|address|location|linkedin|contact|reach you|how to (contact|reach)|where (do you )?live|your (email|phone|address|number)\b)/i;

function isContactIntent(question: string): boolean {
  return CONTACT_INTENT_PATTERN.test(question.trim());
}

/** Fallback contact text when retrieval returns no contact chunks—so personal info always works. */
const CONTACT_FALLBACK = `Contact information:
Email: aurelia.azarmi@gmail.com
Phone: +1(925)915-2274
Address: San Francisco Bay Area
LinkedIn: https://linkedin.com/in/aurelia-azarmi
GitHub: https://github.com/justaurelia`;

/** Contact CTA pills (Email, Phone, LinkedIn, GitHub) shown below assistant message for contact intent. */
const CONTACT_CTA_PILLS: BestSource[] = [
  { title: "Email", url: "mailto:aurelia.azarmi@gmail.com", type: "contact" },
  { title: "Phone", url: "tel:+19259152274", type: "contact" },
  { title: "LinkedIn", url: "https://linkedin.com/in/aurelia-azarmi", type: "contact" },
  { title: "GitHub", url: "https://github.com/justaurelia", type: "contact" },
];

// ─────────────────────────────────────────────────────────────
// Source aggregation by document (docKey, docScore, docMeta)
// ─────────────────────────────────────────────────────────────

/** Max pills for non-definition intents. Definition intent uses 1 max and strict entity match. */
const MAX_BEST_SOURCES_DEFAULT = 1;

function getChunkType(c: RagChunk): "case-study" | "timeline" | null {
  const meta = c.metadata as Record<string, unknown> | null;
  if (meta?.type === "timeline") return "timeline";
  if (meta?.type === "case-study") return "case-study";
  if (c.source.startsWith("02_case-studies/")) return "case-study";
  return null;
}

/** Derive a short label from a GitHub URL (e.g. repo name). */
function githubUrlToTitle(url: string): string {
  try {
    const p = new URL(url).pathname.replace(/^\/+|\/+$/g, "").split("/");
    return p[p.length - 1] || "GitHub";
  } catch {
    return "GitHub";
  }
}

/** docKey for aggregating chunks by document. */
function getDocKey(c: RagChunk): string {
  const meta = c.metadata as Record<string, unknown> | null;
  const slug = typeof meta?.slug === "string" ? meta.slug.trim() : null;
  const title = typeof meta?.title === "string" ? meta.title.trim() : null;
  return (slug ?? title ?? c.source) || c.source;
}

/** docMeta: type, title, slug, url, github from chunk (for filtering). */
function getDocMeta(c: RagChunk): {
  type: "case-study" | "timeline" | null;
  title: string;
  slug: string;
  url: string | null;
  github: string | null;
} {
  const type = getChunkType(c);
  const meta = c.metadata as Record<string, unknown> | null;
  const title = (typeof meta?.title === "string" ? meta.title : null)?.trim();
  const slug = (typeof meta?.slug === "string" ? meta.slug : null)?.trim();
  const url = (typeof meta?.url === "string" ? meta.url : null)?.trim() || null;
  const github = (typeof meta?.github === "string" ? meta.github : null)?.trim() || null;
  const resolvedTitleUrl =
    type && (title && url ? { title, url } : fallbackTitleAndUrl(c.source, type));
  return {
    type,
    title: resolvedTitleUrl?.title ?? title ?? "",
    slug: slug ?? c.source.replace(/\.md$/i, "").replace(/.*\//, "") ?? "",
    url: resolvedTitleUrl?.url ?? url ?? null,
    github: github ?? null,
  };
}

/** One BestSource per doc (case-study/timeline page or github link); url used as dedupe key. */
function getBestSourceFromChunk(c: RagChunk): BestSource | null {
  const type = getChunkType(c);
  const meta = c.metadata as Record<string, unknown> | null;
  if (type === "case-study" || type === "timeline") {
    const title = (typeof meta?.title === "string" ? meta.title : null)?.trim();
    const url = (typeof meta?.url === "string" ? meta.url : null)?.trim();
    const resolved =
      title && url ? { title, url } : fallbackTitleAndUrl(c.source, type);
    if (resolved) return { ...resolved, type };
  }
  if (typeof meta?.github === "string" && meta.github.trim()) {
    const url = (meta.github as string).trim();
    return { title: githubUrlToTitle(url), url, type: "github" };
  }
  return null;
}

/** GitHub pill from a chunk (when user asks about GitHub / code / demos). */
function getGitHubSourceFromChunk(c: RagChunk): BestSource | null {
  const meta = c.metadata as Record<string, unknown> | null;
  if (typeof meta?.github !== "string" || !meta.github.trim()) return null;
  const url = (meta.github as string).trim();
  return { title: githubUrlToTitle(url), url, type: "github" };
}

/** Aggregate by document: docKey, docScore = best (min) score per doc. RPC typically returns distance (lower = better). */
function aggregateByDocument(
  ragChunks: RagChunk[]
): Array<{ docKey: string; docScore: number; docMeta: ReturnType<typeof getDocMeta>; best: BestSource }> {
  const byDoc = new Map<
    string,
    { docScore: number; docMeta: ReturnType<typeof getDocMeta>; best: BestSource }
  >();
  for (const c of ragChunks) {
    const score = typeof c.similarity === "number" ? c.similarity : 0;
    const docKey = getDocKey(c);
    const docMeta = getDocMeta(c);
    const best = getBestSourceFromChunk(c);
    if (!best) continue;
    const existing = byDoc.get(docKey);
    // Keep best (lowest) score per doc when RPC returns distance; else use max for similarity
    const isBetter = existing === undefined || score < existing.docScore;
    if (isBetter) {
      byDoc.set(docKey, { docScore: score, docMeta, best });
    }
  }
  return [...byDoc.entries()].map(([docKey, v]) => ({ docKey, ...v }));
}

/** Entity matches doc for definition intent: slug === entity, title includes entity, or entity includes slug (normalize spaces for slug match). */
function docMatchesEntity(
  entity: string,
  docMeta: { slug: string; title: string }
): boolean {
  if (!entity) return false;
  const slug = docMeta.slug.toLowerCase();
  const title = docMeta.title.toLowerCase();
  const entityNorm = entity.replace(/\s+/g, "").toLowerCase();
  const slugNorm = slug.replace(/\s+/g, "");
  const titleNorm = title.replace(/\s+/g, "");
  return (
    slug === entity ||
    slugNorm === entityNorm ||
    title.includes(entity) ||
    titleNorm.includes(entityNorm) ||
    entityNorm.includes(slugNorm)
  );
}

/**
 * Build pills (URLs to display) from the same RAG chunks used for the message.
 * 1) Specific case study (what is X / define X / explain X) → one pill only (that case study).
 * 2) List case studies ("what are your case studies" etc.) → all case-study pills from results.
 * 3) Other → one pill (best-matching doc by score).
 */
function pickBestSources(ragChunks: RagChunk[], question: string): BestSource[] {
  const docs = aggregateByDocument(ragChunks);
  const byBestFirst = (a: { docScore: number }, b: { docScore: number }) => a.docScore - b.docScore;

  // 1) If user specifically asks about Jucosa or LiveLiveLove → single hardcoded direct-link pill
  const directProduct = getDirectProductFromQuestion(question);
  if (directProduct) {
    return [directProduct];
  }

  // 2) Definition intent (what is X / define X / explain X) → one pill for matching case study
  const { definitionIntent, entity } = parseDefinitionIntent(question);
  if (definitionIntent && entity) {
    const caseStudyDocs = docs.filter(
      (d) => d.docMeta.type === "case-study" && docMatchesEntity(entity, d.docMeta)
    );
    const sorted = caseStudyDocs.sort(byBestFirst);
    return sorted.slice(0, 1).map((d) => d.best);
  }

  // 3) GitHub / code / demo: user asks about GitHub or code → show GitHub pill(s) from RAG results (not case study)
  if (isGitHubIntent(question)) {
    const byUrl = new Map<string, BestSource>();
    for (const c of ragChunks) {
      const github = getGitHubSourceFromChunk(c);
      if (github?.url) byUrl.set(github.url, github);
    }
    if (byUrl.size > 0) return [...byUrl.values()];
  }

  // 3b) Contact intent: show CTA pills (Email, Phone, LinkedIn, GitHub)
  if (isContactIntent(question)) {
    return CONTACT_CTA_PILLS;
  }

  // 4) List case studies: user asks for all → every case study that appears in RAG results (dedupe by url)
  if (isListCaseStudiesIntent(question)) {
    const byUrl = new Map<string, BestSource>();
    for (const d of docs) {
      if (d.docMeta.type === "case-study" && d.best.url) {
        byUrl.set(d.best.url, d.best);
      }
    }
    return [...byUrl.values()];
  }

  // 5) Other: one pill (best doc by score)
  const sorted = docs.sort(byBestFirst);
  return sorted.slice(0, MAX_BEST_SOURCES_DEFAULT).map((d) => d.best);
}

/** Remove markdown links and raw URLs so answer text is clean; pills show links below. */
function stripLinksFromReply(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\bhttps?:\/\/[^\s)]+/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// ─────────────────────────────────────────────────────────────
// Handler
// ─────────────────────────────────────────────────────────────

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // 1) POST only
  if (req.method !== "POST") {
    res
      .status(405)
      .setHeader("Allow", "POST")
      .json({ error: "Method not allowed" });
    return;
  }

  // Parse body
  let body: unknown;
  try {
    body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body ?? null;
  } catch {
    res.status(400).json({ error: "Invalid JSON" });
    return;
  }

  const messages = parseMessages(body);
  if (messages === null) {
    res.status(400).json({ error: "Missing or invalid messages" });
    return;
  }

  // 2) Extract last user message
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const question = lastUser?.content.trim() ?? "";

  if (!question) {
    res.status(400).json({
      reply: "I didn't catch your question. Could you please type something?",
      sources: [],
    });
    return;
  }

  // 2b) Deterministic short timeline: if assistant offered it and user said yes, skip RAG
  const lastAssistant = lastAssistantMessage(messages);
  if (offeredShortTimeline(lastAssistant) && isAffirmative(question)) {
    res.status(200).json({
      reply: SHORT_TIMELINE,
      sources: [],
      bestSources: [{ title: "My journey", url: "/about", type: "timeline" }],
    });
    return;
  }

  // 2c) User said "yes" to an offer (e.g. "Want me to send the link?") → use previous question for RAG so we fulfill the offer
  const isYesToOffer =
    isAffirmative(question) &&
    offeredSomething(lastAssistant) &&
    !offeredShortTimeline(lastAssistant);
  const effectiveQuery = isYesToOffer ? (previousUserMessage(messages) ?? question) : question;

  // Validate env vars (fail fast, no secrets in response)
  const { OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } =
    process.env;

  if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[chat] Missing environment variables");
    res.status(500).json({ error: "Server configuration error" });
    return;
  }

  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // 3) Create embedding (use effectiveQuery so "yes" follow-up retrieves context from the original question)
    const embeddingRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: effectiveQuery,
    });
    const queryEmbedding = embeddingRes.data[0].embedding;

    // 4) Call Supabase RPC match_rag_chunks
    const { data: chunks, error: rpcError } = await supabase.rpc(
      "match_rag_chunks",
      { query_embedding: queryEmbedding, match_count: 8 }
    );

    if (rpcError) {
      console.error("[chat] Supabase RPC error:", rpcError);
      res.status(500).json({ error: "Failed to search knowledge base" });
      return;
    }

    let ragChunks: RagChunk[] = chunks ?? [];

    // 5) Build context string and pills (contact questions always use fallback—no retrieval)
    const contextString = isContactIntent(effectiveQuery)
      ? `SOURCE: contact\n${CONTACT_FALLBACK}`
      : ragChunks.length > 0
        ? ragChunks
            .map(
              (c) =>
                `SOURCE: ${c.source} | SECTION: ${c.section ?? "N/A"}\n${c.content}`
            )
            .join("\n\n---\n\n")
        : "No relevant information found.";
    const bestSources = pickBestSources(ragChunks, effectiveQuery);

    // 6) Call OpenAI chat completion
    const systemPrompt = `You are Aurélia. You are Virtual Aurélia on this portfolio: you speak in first person as her ("I", "my", "me"). You are a founder—direct, warm, and human. Answer only using the provided SOURCES; if the info is not there, say you don't have enough info and suggest what to ask.

Write answers as clear, human explanations. Plain text only.
Never expose internal document names, tags, or RAG metadata (e.g. file paths). When the user asks for contact or personal information (email, phone, address, LinkedIn, GitHub), give them exactly what appears in SOURCES—that is allowed and expected.
Do not cite sources inline. Do not include any URLs or links in your answer—links will be shown separately (except you may mention email or phone as plain text).
Prefer short paragraphs. Separate paragraphs with a blank line (empty line between paragraphs).
Always stay in character as Aurélia: your experience, your choices, your journey.

When a question is about background, career, motivations, or "why", you may reference your professional timeline. Weave it in naturally. Do not list dates unless explicitly asked. You may offer "Want the short timeline?" or "Want the full journey?" as plain text only (no links).`;

    const fulfillOfferInstruction = isYesToOffer
      ? `The user replied "yes" to your previous message. Your previous message was: """${lastAssistant}""" Fulfill the offer you made: provide the link, resource, or next step. Do not ask again or repeat the question; just do it in a short, direct way.`
      : null;

    const contactIntentHint = isContactIntent(effectiveQuery)
      ? "The user is asking for contact or personal information. The SOURCES below contain the contact details (email, phone, address, LinkedIn, GitHub). You MUST give the exact information they asked for (e.g. the phone number, email, or address) from SOURCES. Do not refuse, redirect to LinkedIn only, or say you don't have it—the information is in SOURCES."
      : null;

    const completionMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: systemPrompt },
      { role: "system", content: `SOURCES:\n\n${contextString}` },
    ];
    if (contactIntentHint) {
      completionMessages.push({ role: "system", content: contactIntentHint });
    }
    if (fulfillOfferInstruction) {
      completionMessages.push({ role: "system", content: fulfillOfferInstruction });
    }
    completionMessages.push({ role: "user", content: question });

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      messages: completionMessages,
    });

    let reply =
      completion.choices[0]?.message?.content?.trim() ??
      "I'm having trouble responding right now. Please try again.";
    reply = stripLinksFromReply(reply);

    // 7) Build sources array (bestSources already built in step 5)
    const sources = ragChunks.map((c) => ({
      source: c.source,
      section: c.section,
      similarity: c.similarity,
    }));

    const response: ChatResponse = { reply, sources, bestSources };
    res.status(200).json(response);
  } catch (err) {
    // 8) Log server errors, return safe message
    console.error("[chat] Unexpected error:", err);
    res.status(500).json({
      error: "Something went wrong. Please try again later.",
    });
  }
}
