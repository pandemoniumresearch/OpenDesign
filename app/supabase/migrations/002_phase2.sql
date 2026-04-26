-- Phase 2: relax type constraints and add share tokens

-- Drop and recreate artifacts type check to include 'landing' and keep compat
alter table artifacts drop constraint if exists artifacts_type_check;
alter table artifacts add constraint artifacts_type_check
  check (type in ('prototype', 'deck', 'landing', 'landing-page'));

-- Drop and recreate exports format check to include 'pptx'
alter table exports drop constraint if exists exports_format_check;
alter table exports add constraint exports_format_check
  check (format in ('html', 'pdf', 'mp4', 'pptx'));

-- Share tokens: a UUID column that, when set, makes the artifact publicly viewable
alter table artifacts add column if not exists share_token uuid unique;

create index if not exists artifacts_share_token_idx on artifacts(share_token);

-- user_api_keys: encrypted per-user LLM provider keys
create table if not exists user_api_keys (
  user_id      text primary key,
  anthropic_key text,
  openai_key    text,
  google_key    text,
  updated_at    timestamptz not null default now()
);
