-- Phase 3: add figma_key to user_api_keys, extend exports format check

alter table user_api_keys add column if not exists figma_key text;

-- extend exports format check to include 'react', 'vue', 'svelte' (code handoff)
alter table exports drop constraint if exists exports_format_check;
alter table exports add constraint exports_format_check
  check (format in ('html', 'pdf', 'mp4', 'pptx', 'react', 'vue', 'svelte'));

-- extend artifacts type check to include 'handoff' for future use
alter table artifacts drop constraint if exists artifacts_type_check;
alter table artifacts add constraint artifacts_type_check
  check (type in ('prototype', 'deck', 'landing', 'landing-page', 'handoff'));
