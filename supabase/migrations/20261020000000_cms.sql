-- ============================================================================
-- Khao San CMS - database setup.
--
-- HOW TO RUN: Supabase dashboard -> SQL Editor -> New query -> paste this whole
-- file -> Run. It is safe to run more than once: every statement is
-- idempotent, and nothing here drops or rewrites existing data.
--
-- Requires the menu tables from scripts/setup-db.mjs to exist (for
-- menu_reorder below). If they do not, run that first.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Content documents.
--
-- One row per editable area of the site ('home', 'theme', 'site', ...), the
-- content held as JSON. The site validates and repairs every document when it
-- reads it (lib/cms/fields.ts), so the database deliberately does not
-- constrain the JSON's shape - a schema change in the code never needs a
-- schema change here.
-- ---------------------------------------------------------------------------

-- What visitors see. Readable by anyone (it is the public website).
create table if not exists public.cms_published (
    key          text primary key,
    data         jsonb not null,
    revision     integer not null default 1,
    published_at timestamptz not null default now()
);

-- Work in progress. Server-only: never readable with the public key.
create table if not exists public.cms_drafts (
    key        text primary key,
    data       jsonb not null,
    updated_at timestamptz not null default now()
);

-- Every published version, for "History -> Restore".
create table if not exists public.cms_revisions (
    id         bigint generated always as identity primary key,
    key        text not null,
    revision   integer not null,
    data       jsonb not null,
    note       text,
    created_at timestamptz not null default now(),
    unique (key, revision)
);
create index if not exists cms_revisions_key_idx on public.cms_revisions (key, revision desc);

-- The media library: files uploaded through the admin.
create table if not exists public.cms_media (
    id         uuid primary key default gen_random_uuid(),
    bucket     text not null,
    path       text not null,
    url        text not null,
    kind       text not null check (kind in ('image', 'video', 'font')),
    mime       text not null,
    size       bigint not null default 0,
    width      integer,
    height     integer,
    name       text not null default '',
    alt        text not null default '',
    created_at timestamptz not null default now(),
    unique (bucket, path)
);
create index if not exists cms_media_created_idx on public.cms_media (created_at desc);

-- ---------------------------------------------------------------------------
-- Row level security.
--
-- Supabase grants table access to the public `anon` role by default; RLS is
-- what actually restricts it. Only published content gets a read policy.
-- The admin API uses the service-role key, which bypasses RLS.
-- ---------------------------------------------------------------------------
alter table public.cms_published enable row level security;
alter table public.cms_drafts    enable row level security;
alter table public.cms_revisions enable row level security;
alter table public.cms_media     enable row level security;

drop policy if exists "Public read published content" on public.cms_published;
create policy "Public read published content" on public.cms_published
    for select to anon, authenticated using (true);

-- Belt and braces: no direct table privileges for the public roles on
-- anything but the published content.
revoke all on public.cms_drafts, public.cms_revisions, public.cms_media from anon, authenticated;
revoke insert, update, delete on public.cms_published from anon, authenticated;
grant select on public.cms_published to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Publish: draft -> published, recorded in history, in ONE transaction, so a
-- failure halfway can never leave the live site and the history disagreeing.
-- ---------------------------------------------------------------------------
create or replace function public.cms_publish(p_key text, p_note text default null)
returns integer
language plpgsql
set search_path = public
as $$
declare
    v_data jsonb;
    v_rev  integer;
begin
    select data into v_data from cms_drafts where key = p_key for update;
    if v_data is null then
        raise exception 'There are no unpublished changes for "%".', p_key using errcode = 'P0002';
    end if;

    select coalesce(max(revision), 0) + 1 into v_rev from cms_revisions where key = p_key;

    insert into cms_revisions (key, revision, data, note) values (p_key, v_rev, v_data, p_note);

    insert into cms_published (key, data, revision, published_at)
    values (p_key, v_data, v_rev, now())
    on conflict (key) do update
        set data = excluded.data, revision = excluded.revision, published_at = excluded.published_at;

    delete from cms_drafts where key = p_key;
    return v_rev;
end;
$$;

revoke all on function public.cms_publish(text, text) from public, anon, authenticated;
grant execute on function public.cms_publish(text, text) to service_role;

-- ---------------------------------------------------------------------------
-- Menu drag-and-drop: rewrite sort_order for categories and dishes in one
-- statement each, in the order given.
-- ---------------------------------------------------------------------------
create or replace function public.menu_reorder(p_categories text[], p_items uuid[])
returns void
language sql
set search_path = public
as $$
    update menu_categories c set sort_order = o.ord - 1
      from unnest(p_categories) with ordinality as o(id, ord)
     where c.id = o.id;
    update menu_items i set sort_order = o.ord - 1
      from unnest(p_items) with ordinality as o(id, ord)
     where i.id = o.id;
$$;

revoke all on function public.menu_reorder(text[], uuid[]) from public, anon, authenticated;
grant execute on function public.menu_reorder(text[], uuid[]) to service_role;

-- ---------------------------------------------------------------------------
-- Storage bucket for uploads. Public read (the images are on a public
-- website); uploads only happen through signed URLs the admin API issues.
-- The size limit and type list are enforced by Supabase itself, on top of
-- the checks in the admin API.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'site-media', 'site-media', true, 52428800,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
          'video/mp4', 'video/webm',
          'font/woff2', 'font/woff', 'font/ttf', 'font/otf']
)
on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Ask PostgREST to pick up the new tables and functions immediately.
notify pgrst, 'reload schema';
