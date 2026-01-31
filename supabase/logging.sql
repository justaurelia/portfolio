-- Enable required extension
create extension if not exists "pgcrypto";

-- Table to store user questions from the chat
create table public.chat_questions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Anonymous session tracking
  session_id text not null,

  -- Context
  page_path text,
  question text not null,

  -- Optional analytics
  model text,
  answer_id uuid,
  pill_url text,

  -- Privacy / moderation
  is_redacted boolean not null default false
);

-- Indexes for analytics
create index chat_questions_created_at_idx
  on public.chat_questions (created_at desc);

create index chat_questions_session_idx
  on public.chat_questions (session_id);

create index chat_questions_question_idx
  on public.chat_questions
  using gin (to_tsvector('english', question));

-- Enable RLS
alter table public.chat_questions enable row level security;

-- Block all direct access (server-only writes)
create policy "block select"
on public.chat_questions
for select
using (false);

create policy "block insert"
on public.chat_questions
for insert
with check (false);

create policy "block update"
on public.chat_questions
for update
using (false);

create policy "block delete"
on public.chat_questions
for delete
using (false);
