import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { PDFParse } from "pdf-parse";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

type ChunkRow = {
  source: string;
  section: string | null;
  content: string;
  embedding: number[];
  metadata: Record<string, any>;
};

/** Parse YAML-like frontmatter (--- ... ---) and return { body, type?, title?, slug?, url?, github? }. */
function parseFrontmatter(raw: string): {
  body: string;
  type?: string;
  title?: string;
  slug?: string;
  url?: string;
  github?: string;
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { body: raw };
  const [, fm, body] = match;
  let type: string | undefined;
  let title: string | undefined;
  let slug: string | undefined;
  let url: string | undefined;
  let github: string | undefined;
  const typeLine = fm?.match(/^type:\s*["']?([^"'\n]+)["']?\s*$/m);
  if (typeLine) type = typeLine[1];
  const titleLine = fm?.match(/^title:\s*["']?([^"'\n]+)["']?\s*$/m);
  if (titleLine) title = titleLine[1].trim();
  const slugLine = fm?.match(/^slug:\s*["']?([^"'\n]+)["']?\s*$/m);
  if (slugLine) slug = slugLine[1].trim();
  const urlLine = fm?.match(/^url:\s*["']?([^"'\n]+)["']?\s*$/m);
  if (urlLine) url = urlLine[1].trim();
  const githubLine = fm?.match(/^github:\s*["']?([^"'\n]+)["']?\s*$/m);
  if (githubLine) github = githubLine[1].trim();
  return { body: body?.trim() ?? raw, type, title, slug, url, github };
}

// -------------------- CONFIG --------------------
const SOURCES_DIR = path.join(process.cwd(), "rag", "sources");
const MANIFEST_PATH = path.join(process.cwd(), "rag", ".ingest-manifest.json");
const FULL_INGEST = process.env.FULL_INGEST === "1" || process.env.FULL_INGEST === "true";
const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";
const EMBEDDING_DIM = Number(process.env.EMBEDDING_DIM || "1536");

// chunking defaults (tune later)
const CHUNK_SIZE = Number(process.env.CHUNK_SIZE || "1000"); // chars
const OVERLAP = Number(process.env.OVERLAP || "200"); // chars
const BATCH_SIZE = Number(process.env.BATCH_SIZE || "50"); // supabase insert batch

// -------------------- CLIENTS --------------------
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// -------------------- HELPERS --------------------
function walk(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return walk(p);
    return [p];
  });
}

function extOf(file: string) {
  return path.extname(file).toLowerCase();
}

async function readFileAsText(filePath: string): Promise<string> {
  const ext = extOf(filePath);

  if (ext === ".pdf") {
    const buf = fs.readFileSync(filePath);
    const parser = new PDFParse({ data: buf });
    try {
      const result = await parser.getText();
      return (result?.text ?? "").trim();
    } finally {
      await parser.destroy();
    }
  }

  // md/txt/json/csv etc as text
  return fs.readFileSync(filePath, "utf8").trim();
}

function normalizeText(text: string) {
  return text.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
}

/**
 * Lightweight section detection for markdown:
 * Splits by headings (#, ##, ###) and returns {section, textBlock} blocks.
 * If no headings, returns one block with section = null.
 */
function splitByMarkdownHeadings(md: string): Array<{ section: string | null; text: string }> {
  const lines = md.split("\n");
  const blocks: Array<{ section: string | null; text: string }> = [];

  let currentSection: string | null = null;
  let buf: string[] = [];

  const flush = () => {
    const t = normalizeText(buf.join("\n"));
    if (t) blocks.push({ section: currentSection, text: t });
    buf = [];
  };

  for (const line of lines) {
    const m = line.match(/^(#{1,3})\s+(.*)\s*$/);
    if (m) {
      flush();
      currentSection = m[2]?.trim() || null;
    } else {
      buf.push(line);
    }
  }
  flush();

  // If markdown is tiny or headings-only, fallback
  if (blocks.length === 0) return [{ section: null, text: normalizeText(md) }];
  return blocks.filter((b) => b.text.length > 0);
}

function chunkText(text: string, chunkSize = CHUNK_SIZE, overlap = OVERLAP): string[] {
  const clean = normalizeText(text);
  if (!clean) return [];

  const chunks: string[] = [];
  let i = 0;
  while (i < clean.length) {
    chunks.push(clean.slice(i, i + chunkSize));
    i += Math.max(1, chunkSize - overlap);
  }
  return chunks.filter((c) => c.trim().length >= 80);
}

function hashContent(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

async function embedBatch(texts: string[]): Promise<number[][]> {
  const res = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
    encoding_format: "float",
  });

  const out = res.data.map((d) => d.embedding as number[]);
  // sanity check (optional)
  for (const e of out) {
    if (EMBEDDING_DIM && e.length !== EMBEDDING_DIM) {
      throw new Error(`Embedding dim mismatch. Expected ${EMBEDDING_DIM}, got ${e.length}.`);
    }
  }
  return out;
}

async function wipeAll() {
  const { error } = await supabase.from("rag_chunks").delete().neq("id", 0);
  if (error) throw error;
}

async function deleteChunksBySource(source: string) {
  const { error } = await supabase.from("rag_chunks").delete().eq("source", source);
  if (error) throw error;
}

async function insertRows(rows: ChunkRow[]) {
  const { error } = await supabase.from("rag_chunks").insert(rows);
  if (error) throw error;
}

type Manifest = Record<string, string>; // source path -> content hash

function loadManifest(): Manifest {
  try {
    const raw = fs.readFileSync(MANIFEST_PATH, "utf8");
    return JSON.parse(raw) as Manifest;
  } catch {
    return {};
  }
}

function saveManifest(manifest: Manifest) {
  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf8");
}

// -------------------- MAIN --------------------
async function main() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.OPENAI_API_KEY) {
    throw new Error("Missing env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY");
  }

  const files = walk(SOURCES_DIR).filter((f) => {
    const e = extOf(f);
    return [".md", ".txt", ".json", ".pdf", ".csv"].includes(e);
  });

  if (files.length === 0) {
    console.log("No files found in rag/sources.");
    return;
  }

  const currentRelPaths = new Set(
    files.map((f) => path.relative(SOURCES_DIR, f).replaceAll("\\", "/"))
  );

  let manifest = loadManifest();

  if (FULL_INGEST) {
    console.log("▶ Full ingest: wiping rag_chunks and re-ingesting all files.");
    await wipeAll();
    console.log("🧹 Cleared rag_chunks");
    manifest = {};
  } else {
    console.log("▶ Incremental ingest: only new or updated files.");
    // Remove chunks for sources that no longer exist on disk
    for (const rel of Object.keys(manifest)) {
      if (!currentRelPaths.has(rel)) {
        await deleteChunksBySource(rel);
        delete manifest[rel];
        console.log("🗑 Removed chunks for deleted source:", rel);
      }
    }
  }

  let totalChunks = 0;
  let processedCount = 0;
  let skippedCount = 0;

  for (const file of files) {
    const rel = path.relative(SOURCES_DIR, file).replaceAll("\\", "/");
    const ext = extOf(file);

    let raw = await readFileAsText(file);
    if (!raw) continue;

    // Parse frontmatter for .md to get type, title, slug, url, github and body for chunking
    let sourceType: string | undefined;
    let sourceTitle: string | undefined;
    let sourceSlug: string | undefined;
    let sourceUrl: string | undefined;
    let sourceGithub: string | undefined;
    if (ext === ".md") {
      const { body, type, title, slug, url, github } = parseFrontmatter(raw);
      raw = body;
      sourceType = type;
      sourceTitle = title;
      sourceSlug = slug;
      sourceUrl = url;
      sourceGithub = github;
    }
    // Fallback slug from filename (e.g. 02_case-studies/jucosa.md → jucosa)
    if (!sourceSlug && rel) {
      const stem = path.basename(rel, path.extname(rel));
      if (stem) sourceSlug = stem;
    }

    const contentHash = hashContent(raw);

    if (!FULL_INGEST && manifest[rel] === contentHash) {
      skippedCount++;
      process.stdout.write(`⏭ Skip (unchanged): ${rel}\n`);
      continue;
    }

    // New or updated: remove existing chunks for this source, then ingest
    if (!FULL_INGEST) {
      await deleteChunksBySource(rel);
    }

    const blocks =
      ext === ".md" ? splitByMarkdownHeadings(raw) : [{ section: null, text: raw }];

    const pending: Omit<ChunkRow, "embedding">[] = [];

    for (const b of blocks) {
      const chunks = chunkText(b.text);
      for (const c of chunks) {
        const metadata: Record<string, any> = {
          ext,
          sha256: hashContent(`${rel}|${b.section ?? ""}|${c}`),
        };
        if (sourceType) metadata.type = sourceType;
        if (sourceTitle) metadata.title = sourceTitle;
        if (sourceSlug) metadata.slug = sourceSlug;
        if (sourceUrl) metadata.url = sourceUrl;
        if (sourceGithub) metadata.github = sourceGithub;
        pending.push({
          source: rel,
          section: b.section,
          content: c,
          metadata,
        });
      }
    }

    if (pending.length === 0) {
      manifest[rel] = contentHash;
      continue;
    }

    for (let i = 0; i < pending.length; i += BATCH_SIZE) {
      const slice = pending.slice(i, i + BATCH_SIZE);
      const embeddings = await embedBatch(slice.map((s) => s.content));

      const rows: ChunkRow[] = slice.map((s, idx) => ({
        ...s,
        embedding: embeddings[idx],
      }));

      await insertRows(rows);
      totalChunks += rows.length;

      process.stdout.write(
        `✅ ${rel}  (${Math.min(i + BATCH_SIZE, pending.length)}/${pending.length})  total=${totalChunks}\r`
      );
    }
    process.stdout.write("\n");
    manifest[rel] = contentHash;
    processedCount++;
  }

  saveManifest(manifest);

  console.log(
    `\n🎉 Done. Inserted ${totalChunks} chunks from ${processedCount} new/updated file(s), skipped ${skippedCount} unchanged.`
  );
}

main().catch((e) => {
  console.error("\n❌ Ingest failed:", e);
  process.exit(1);
});
