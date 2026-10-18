-- 018: campaign content requirements
-- Brands specify what kind of promotion they want and the technical specs.

alter table campaigns
  add column if not exists promo_formats text[] not null default '{video}',
  -- e.g. '{video}', '{video,logo_overlay}', '{banner,voiceover}'
  add column if not exists aspect_ratios text[] not null default '{9:16}',
  -- e.g. '{9:16}', '{9:16,16:9}'
  add column if not exists min_duration_sec int,
  add column if not exists max_duration_sec int,
  add column if not exists required_hashtags text[] not null default '{}',
  add column if not exists required_tags text[] not null default '{}',
  -- accounts to @mention
  add column if not exists source_material_url text,
  -- where clippers get the content to clip from (drive link, youtube, etc.)
  add column if not exists min_clips_expected int not null default 1,
  add column if not exists requires_preapproval boolean not null default false;
  -- brand reviews clip before it goes live
