-- RAG chunks table for portfolio knowledge (pgvector)
-- Run this in the Supabase SQL editor.

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create rag_chunks table
CREATE TABLE IF NOT EXISTS rag_chunks (
  id         bigserial PRIMARY KEY,
  source     text NOT NULL,
  section    text,
  content    text NOT NULL,
  embedding  vector(1536),
  metadata   jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- 3. Index on embedding for cosine similarity search
-- ivfflat with vector_cosine_ops; lists = 100 is fine for small/medium datasets
CREATE INDEX IF NOT EXISTS rag_chunks_embedding_idx
  ON rag_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- 4. Index on source for filtering by file
CREATE INDEX IF NOT EXISTS rag_chunks_source_idx ON rag_chunks (source);

-- Optional: comment the table for clarity
COMMENT ON TABLE rag_chunks IS 'RAG knowledge chunks with embeddings for semantic search (cosine similarity).';
