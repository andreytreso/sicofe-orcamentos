-- Promote the current signed-in user (by id seen in recent requests) to admin
-- This uses the id from the latest network request token: 4c2b3bf1-6245-44dd-8f29-3a1cf4a2898c
-- The is_admin(uid) function already checks profiles.role = 'admin'

begin;

-- 1) Ensure a profiles row exists for this user, then set role='admin'
update public.profiles
set role = 'admin'
where user_id = '4c2b3bf1-6245-44dd-8f29-3a1cf4a2898c';

-- If no row was updated, insert a minimal row and set role
insert into public.profiles (user_id, role)
select '4c2b3bf1-6245-44dd-8f29-3a1cf4a2898c', 'admin'
where not exists (
  select 1 from public.profiles where user_id = '4c2b3bf1-6245-44dd-8f29-3a1cf4a2898c'
);

commit;