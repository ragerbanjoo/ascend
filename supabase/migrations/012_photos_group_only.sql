-- ============================================
-- Photos are now group-shared only.
-- Drop the private/group distinction; keep visibility column with default 'group'
-- so any old client code that still references it continues to work.
-- ============================================

-- Normalize any existing rows to 'group'. (Most prod data was 'private' under
-- the old encrypted-photo model — those storage objects are encrypted blobs
-- that the new client cannot display, so we drop their DB rows below. The
-- orphaned storage objects can be cleaned up from the dashboard.)
delete from photos where visibility = 'private';

-- Loosen the check constraint and set 'group' as default.
alter table photos drop constraint if exists photos_visibility_check;
alter table photos alter column visibility set default 'group';
update photos set visibility = 'group' where visibility is distinct from 'group';
alter table photos add constraint photos_visibility_check check (visibility = 'group');

-- Drop the old "private individual photos shared via prefs" policy — no longer
-- applicable since there are no private photos.
drop policy if exists "Shared individual photos" on photos;

-- The "Group photos visible" policy already covers the new model.
