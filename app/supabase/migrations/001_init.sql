-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Projects: top-level containers owned by a user (Clerk userId)
create table if not exists projects (
  id          uuid primary key default uuid_generate_v4(),
  user_id     text not null,
  name        text not null default 'Untitled Project',
  brand_context jsonb default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index projects_user_id_idx on projects(user_id);

-- Artifacts: generated outputs (prototype, deck, landing page)
create table if not exists artifacts (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid not null references projects(id) on delete cascade,
  type        text not null check (type in ('prototype', 'deck', 'landing-page')),
  document    jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create index artifacts_project_id_idx on artifacts(project_id);

-- Exports: tracked export jobs
create table if not exists exports (
  id            uuid primary key default uuid_generate_v4(),
  artifact_id   uuid not null references artifacts(id) on delete cascade,
  format        text not null check (format in ('html', 'pdf', 'mp4')),
  storage_path  text,
  status        text not null default 'pending' check (status in ('pending', 'processing', 'done', 'error')),
  error_message text,
  created_at    timestamptz not null default now()
);

-- RLS: users can only see their own projects and related artifacts
alter table projects enable row level security;
alter table artifacts enable row level security;
alter table exports enable row level security;

create policy "Users see own projects"
  on projects for all using (user_id = auth.jwt() ->> 'sub');

create policy "Users see artifacts of own projects"
  on artifacts for all using (
    project_id in (select id from projects where user_id = auth.jwt() ->> 'sub')
  );

create policy "Users see exports of own artifacts"
  on exports for all using (
    artifact_id in (
      select a.id from artifacts a
      join projects p on p.id = a.project_id
      where p.user_id = auth.jwt() ->> 'sub'
    )
  );

-- Auto-update updated_at on projects
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger projects_updated_at
  before update on projects
  for each row execute function update_updated_at();
