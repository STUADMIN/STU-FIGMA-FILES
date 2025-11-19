-- STU seed: schema and data
-- Run this in your Supabase project's SQL Editor (Dashboard → SQL) as an admin.
-- It creates basic tables and seeds organizations/people, and creates an auth user for Lisa Terry.

begin;

-- Extensions (usually enabled already)
create extension if not exists pgcrypto;

-- Core tables
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  organization_id uuid references public.organizations(id) on delete set null,
  email text unique,
  created_at timestamptz not null default now()
);

create index if not exists people_org_idx on public.people(organization_id);

-- Activity log storage for tender timeline entries
create table if not exists public.tender_activity_logs (
  id uuid primary key default gen_random_uuid(),
  tender_id text not null,
  note text not null,
  status_snapshot text,
  type text not null default 'note',
  author_id uuid references auth.users(id) on delete set null,
  author_name text,
  author_initials text,
  created_at timestamptz not null default now()
);

create index if not exists tender_activity_logs_tender_id_idx on public.tender_activity_logs(tender_id);

-- Organizations
insert into public.organizations(name) values
  ('Ratchet & Sons Construction Co.'),
  ('Screwloose Solutions Ltd'),
  ('Mortar Marvels'),
  ('Gap Fillers UK'),
  ('SpannerWorks Ltd'),
  ('Drillmore Developments'),
  ('Smooth Finish Interiors'),
  ('Trowel & Error Ltd'),
  ('Beamish Builders'),
  ('Tile Expectations'),
  ('STU')
on conflict(name) do nothing;

-- People (with org lookup by name)
with orgs as (
  select id, name from public.organizations
)
insert into public.people(first_name, last_name, organization_id, email) values
  ('Bob','Ratchet',          (select id from orgs where name='Ratchet & Sons Construction Co.'), null),
  ('Stan','Screwloose',      (select id from orgs where name='Screwloose Solutions Ltd'),       null),
  ('Mick','Mortar',          (select id from orgs where name='Mortar Marvels'),                 null),
  ('Phil','TheGap',          (select id from orgs where name='Gap Fillers UK'),                 null),
  ('Chuck','Spanner',        (select id from orgs where name='SpannerWorks Ltd'),               null),
  ('Al','Drillmore',         (select id from orgs where name='Drillmore Developments'),         null),
  ('Gerry','Plasterson',     (select id from orgs where name='Smooth Finish Interiors'),        null),
  ('Timmy','Trowel',         (select id from orgs where name='Trowel & Error Ltd'),             'timmy.trowel@te.com'),
  ('Ben','Beamish',          (select id from orgs where name='Beamish Builders'),               null),
  ('Terry','Tileman',        (select id from orgs where name='Tile Expectations'),              null),
  ('Lisa','Terry',           (select id from orgs where name='STU'),                            'lisa.terry@stu.com'),
  -- Additional demo users (STU org)
  ('Priya','Shah',           (select id from orgs where name='STU'),                            'priya.shah@stu.com'),
  ('Owen','Carter',          (select id from orgs where name='STU'),                            'owen.carter@stu.com'),
  ('Alex','Mason',           (select id from orgs where name='STU'),                            'alex.mason@stu.com')
on conflict (email) do nothing;

-- Auth users (SQL helper)
-- Lisa Terry (confirmed) with provided password
select auth.create_user(
  email => 'lisa.terry@stu.com',
  password => 'Qwertyuiop1!',
  email_confirm => true
)
where not exists (select 1 from auth.users where email = 'lisa.terry@stu.com');

-- Timmy Trowel account
select auth.create_user(
  email => 'timmy.trowel@te.com',
  password => 'qwertyuop1!',
  email_confirm => true
)
where not exists (select 1 from auth.users where email = 'timmy.trowel@te.com');

-- Additional demo accounts (STU)
select auth.create_user(
  email => 'priya.shah@stu.com',
  password => 'Qwertyuiop1!',
  email_confirm => true
)
where not exists (select 1 from auth.users where email = 'priya.shah@stu.com');

select auth.create_user(
  email => 'owen.carter@stu.com',
  password => 'Qwertyuiop1!',
  email_confirm => true
)
where not exists (select 1 from auth.users where email = 'owen.carter@stu.com');

select auth.create_user(
  email => 'alex.mason@stu.com',
  password => 'Qwertyuiop1!',
  email_confirm => true
)
where not exists (select 1 from auth.users where email = 'alex.mason@stu.com');

commit;

-- Note: RLS policies are not added here yet. We can define tenant-aware RLS later.
-- STU seed data: organizations, contacts, and initial auth user (Lisa Terry)
-- Run this in Supabase SQL Editor (project dashboard → SQL → New query)
-- Safe to run multiple times (uses IF NOT EXISTS / ON CONFLICT DO NOTHING)

begin;

-- Extensions needed for UUID generation (usually enabled by default on Supabase)
create extension if not exists pgcrypto;

-- Organizations (tenants)
create table if not exists public.organizations (
  id            uuid primary key default gen_random_uuid(),
  name          text not null unique,
  created_at    timestamptz not null default now()
);

-- Contacts/people (not necessarily app users)
create table if not exists public.contacts (
  id               uuid primary key default gen_random_uuid(),
  first_name       text not null,
  last_name        text not null,
  email            text,
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  created_at       timestamptz not null default now(),
  unique (first_name, last_name, organization_id)
);

-- Seed organizations
insert into public.organizations (name) values
  ('Ratchet & Sons Construction Co.'),
  ('Screwloose Solutions Ltd'),
  ('Mortar Marvels'),
  ('Gap Fillers UK'),
  ('SpannerWorks Ltd'),
  ('Drillmore Developments'),
  ('Smooth Finish Interiors'),
  ('Trowel & Error Ltd'),
  ('Beamish Builders'),
  ('Tile Expectations'),
  ('STU')
on conflict (name) do nothing;

-- Helper to look up org id by name
with org as (
  select id, name from public.organizations
)
insert into public.contacts (first_name, last_name, email, organization_id)
values
  ('Bob','Ratchet', null, (select id from org where name = 'Ratchet & Sons Construction Co.')),
  ('Stan','Screwloose', null, (select id from org where name = 'Screwloose Solutions Ltd')),
  ('Mick','Mortar', null, (select id from org where name = 'Mortar Marvels')),
  ('Phil','TheGap', null, (select id from org where name = 'Gap Fillers UK')),
  ('Chuck','Spanner', null, (select id from org where name = 'SpannerWorks Ltd')),
  ('Al','Drillmore', null, (select id from org where name = 'Drillmore Developments')),
  ('Gerry','Plasterson', null, (select id from org where name = 'Smooth Finish Interiors')),
  ('Timmy','Trowel', null, (select id from org where name = 'Trowel & Error Ltd')),
  ('Ben','Beamish', null, (select id from org where name = 'Beamish Builders')),
  ('Terry','Tileman', null, (select id from org where name = 'Tile Expectations'))
on conflict (first_name, last_name, organization_id) do nothing;

-- Create initial auth user for STU: Lisa Terry
-- Note: This requires owner/service privileges (SQL editor has them in Supabase).
-- The user will be email-confirmed immediately and can log in with the password below.
select auth.create_user(
  email => 'lisa.terry@stu.com',
  password => 'Qwertyuiop1!',
  email_confirm => true,
  user_metadata => jsonb_build_object('first_name','Lisa','last_name','Terry','organization','STU')
)
where not exists (select 1 from auth.users where email = 'lisa.terry@stu.com');

-- Also store Lisa as a contact linked to the STU organization (idempotent)
insert into public.contacts (first_name, last_name, email, organization_id)
select 'Lisa','Terry','lisa.terry@stu.com', o.id
from public.organizations o
where o.name = 'STU'
on conflict (first_name, last_name, organization_id) do nothing;

commit;

-- Optional: If you want to add a Timmy Trowel auth user, uncomment and set an email:
-- select auth.create_user(
--   email => 'timmy.trowel@your-domain.com',
--   password => 'qwertyuop1!',
--   email_confirm => true,
--   user_metadata => jsonb_build_object('first_name','Timmy','last_name','Trowel','organization','Trowel & Error Ltd')
-- )
-- where not exists (select 1 from auth.users where email = 'timmy.trowel@your-domain.com');


-- Tender change history
create table if not exists public.tender_change_logs (
    id uuid primary key default gen_random_uuid(),
    tender_id uuid not null references public.tenders(id) on delete cascade,
    field text not null check (field in ('background','description')),
    previous_value text,
    new_value text,
    changed_by text not null,
    changed_by_id uuid,
    changed_at timestamptz not null default now()
);

create index if not exists tender_change_logs_tender_id_idx on public.tender_change_logs(tender_id, changed_at desc);
