create table if not exists user_api_keys (
  user_id    text primary key,
  anthropic_key text,
  openai_key    text,
  google_key    text,
  updated_at    timestamptz default now()
);
