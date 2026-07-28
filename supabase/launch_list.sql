-- Launch list for parkiwell.com.
--
-- Apply to the same Supabase project the app uses:
--   supabase db execute --file supabase/launch_list.sql
-- or paste it into the SQL editor.
--
-- The site holds no session and identifies nobody. It writes one row and can
-- never read one back, which is what the policies below are for: the anon role
-- gets insert and nothing else, so the anon key in the site's environment is
-- worth nothing beyond adding an address. Reading the list needs the service
-- role, which only ever lives in the dashboard.

create table if not exists public.launch_list (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null default 'site',
  created_at timestamptz not null default timezone('utc', now())
);

-- Signing up twice is not an error, it is the same person being careful.
-- The unique index is what lets an insert be quietly ignored the second time,
-- so the response cannot be used to test whether an address is on the list.
create unique index if not exists launch_list_email_key
  on public.launch_list (lower(email));

alter table public.launch_list enable row level security;

drop policy if exists launch_list_insert_anon on public.launch_list;
drop policy if exists launch_list_no_select on public.launch_list;

create policy launch_list_insert_anon on public.launch_list
  for insert to anon
  with check (
    email is not null
    and length(email) between 6 and 254
    and email like '%_@_%.__%'
    and source = 'site'
  );

-- No select policy exists on purpose. With row level security on and nothing
-- granting select, the anon role cannot read the table at all.

revoke all on public.launch_list from anon;
grant insert on public.launch_list to anon;
