-- Prelaunch hardening snapshot
-- Este archivo versiona el estado de seguridad aplicado manualmente en Supabase
-- durante la auditoría pre-lanzamiento. No altera el frontend por sí solo.

-- commercial_leads: dejar solo insert público
drop policy if exists commercial_leads_select_public on public.commercial_leads;
drop policy if exists commercial_leads_update_public on public.commercial_leads;
drop policy if exists commercial_leads_delete_public on public.commercial_leads;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'commercial_leads'
      and policyname = 'commercial_leads_insert_public'
  ) then
    create policy commercial_leads_insert_public
    on public.commercial_leads
    for insert
    with check (true);
  end if;
end $$;

-- points: quitar escritura pública
drop policy if exists "Allow full access to points" on public.points;
drop policy if exists points_insert on public.points;
drop policy if exists points_update on public.points;
drop policy if exists points_delete on public.points;

-- bookings: lectura solo admin autenticado
drop policy if exists bookings_public_read on public.bookings;

grant select on public.bookings to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'bookings'
      and policyname = 'bookings_admin_read'
  ) then
    create policy bookings_admin_read
    on public.bookings
    for select
    to authenticated
    using (public.psr_is_admin());
  end if;
end $$;

-- lap_times: lectura pública, escritura solo admin
drop policy if exists "Allow full access to lap_times" on public.lap_times;
drop policy if exists lap_times_insert on public.lap_times;
drop policy if exists lap_times_update on public.lap_times;
drop policy if exists lap_times_delete on public.lap_times;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'lap_times' and policyname = 'lap_times_select_public'
  ) then
    create policy lap_times_select_public
    on public.lap_times
    for select
    using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'lap_times' and policyname = 'lap_times_admin_insert'
  ) then
    create policy lap_times_admin_insert
    on public.lap_times
    for insert
    to authenticated
    with check (public.psr_is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'lap_times' and policyname = 'lap_times_admin_update'
  ) then
    create policy lap_times_admin_update
    on public.lap_times
    for update
    to authenticated
    using (public.psr_is_admin())
    with check (public.psr_is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'lap_times' and policyname = 'lap_times_admin_delete'
  ) then
    create policy lap_times_admin_delete
    on public.lap_times
    for delete
    to authenticated
    using (public.psr_is_admin());
  end if;
end $$;

-- challenge_entries: lectura pública, escritura solo admin
drop policy if exists challenge_entries_select_public on public.challenge_entries;
drop policy if exists challenge_entries_insert_public on public.challenge_entries;
drop policy if exists challenge_entries_update_public on public.challenge_entries;
drop policy if exists challenge_entries_delete_public on public.challenge_entries;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'challenge_entries' and policyname = 'challenge_entries_select_public'
  ) then
    create policy challenge_entries_select_public
    on public.challenge_entries
    for select
    using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'challenge_entries' and policyname = 'challenge_entries_admin_insert'
  ) then
    create policy challenge_entries_admin_insert
    on public.challenge_entries
    for insert
    to authenticated
    with check (public.psr_is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'challenge_entries' and policyname = 'challenge_entries_admin_update'
  ) then
    create policy challenge_entries_admin_update
    on public.challenge_entries
    for update
    to authenticated
    using (public.psr_is_admin())
    with check (public.psr_is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'challenge_entries' and policyname = 'challenge_entries_admin_delete'
  ) then
    create policy challenge_entries_admin_delete
    on public.challenge_entries
    for delete
    to authenticated
    using (public.psr_is_admin());
  end if;
end $$;

-- weekly_challenges: lectura pública, escritura solo admin
drop policy if exists "Allow full access to weekly_challenges" on public.weekly_challenges;
drop policy if exists weekly_challenges_select_public on public.weekly_challenges;
drop policy if exists weekly_challenges_insert_public on public.weekly_challenges;
drop policy if exists weekly_challenges_update_public on public.weekly_challenges;
drop policy if exists weekly_challenges_delete_public on public.weekly_challenges;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'weekly_challenges' and policyname = 'weekly_challenges_select_public'
  ) then
    create policy weekly_challenges_select_public
    on public.weekly_challenges
    for select
    using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'weekly_challenges' and policyname = 'weekly_challenges_admin_insert'
  ) then
    create policy weekly_challenges_admin_insert
    on public.weekly_challenges
    for insert
    to authenticated
    with check (public.psr_is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'weekly_challenges' and policyname = 'weekly_challenges_admin_update'
  ) then
    create policy weekly_challenges_admin_update
    on public.weekly_challenges
    for update
    to authenticated
    using (public.psr_is_admin())
    with check (public.psr_is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'weekly_challenges' and policyname = 'weekly_challenges_admin_delete'
  ) then
    create policy weekly_challenges_admin_delete
    on public.weekly_challenges
    for delete
    to authenticated
    using (public.psr_is_admin());
  end if;
end $$;

-- monthly_challenges: lectura pública, escritura solo admin
drop policy if exists "Allow full access to monthly_challenges" on public.monthly_challenges;
drop policy if exists monthly_challenges_select_public on public.monthly_challenges;
drop policy if exists monthly_challenges_insert_public on public.monthly_challenges;
drop policy if exists monthly_challenges_update_public on public.monthly_challenges;
drop policy if exists monthly_challenges_delete_public on public.monthly_challenges;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'monthly_challenges' and policyname = 'monthly_challenges_select_public'
  ) then
    create policy monthly_challenges_select_public
    on public.monthly_challenges
    for select
    using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'monthly_challenges' and policyname = 'monthly_challenges_admin_insert'
  ) then
    create policy monthly_challenges_admin_insert
    on public.monthly_challenges
    for insert
    to authenticated
    with check (public.psr_is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'monthly_challenges' and policyname = 'monthly_challenges_admin_update'
  ) then
    create policy monthly_challenges_admin_update
    on public.monthly_challenges
    for update
    to authenticated
    using (public.psr_is_admin())
    with check (public.psr_is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'monthly_challenges' and policyname = 'monthly_challenges_admin_delete'
  ) then
    create policy monthly_challenges_admin_delete
    on public.monthly_challenges
    for delete
    to authenticated
    using (public.psr_is_admin());
  end if;
end $$;

-- booking_attempts: insert público controlado, lectura solo admin
drop policy if exists booking_attempts_select_public on public.booking_attempts;
drop policy if exists booking_attempts_update_public on public.booking_attempts;
drop policy if exists booking_attempts_delete_public on public.booking_attempts;
drop policy if exists booking_attempts_insert_public on public.booking_attempts;
drop policy if exists booking_attempts_admin_read on public.booking_attempts;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'booking_attempts'
      and policyname = 'booking_attempts_public_insert'
  ) then
    create policy booking_attempts_public_insert
    on public.booking_attempts
    for insert
    to anon, authenticated
    with check (
      booking_date is not null
      and booking_time is not null
      and coalesce(simulators, 0) > 0
      and coalesce(attempt_status, '') <> ''
    );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'booking_attempts'
      and policyname = 'booking_attempts_admin_read'
  ) then
    create policy booking_attempts_admin_read
    on public.booking_attempts
    for select
    to authenticated
    using (public.psr_is_admin());
  end if;
end $$;

-- RPCs sensibles: sacar public/anon donde corresponde
do $$
declare
  r record;
begin
  for r in
    select
      n.nspname as schema_name,
      p.proname as function_name,
      pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'psr_update_booking_safe',
        'psr_delete_booking_safe',
        'delete_weekly_challenge_safe',
        'delete_monthly_challenge_safe',
        'upsert_weekly_entry_safe',
        'upsert_monthly_entry_safe'
      )
  loop
    execute format(
      'revoke execute on function %I.%I(%s) from public, anon',
      r.schema_name,
      r.function_name,
      r.args
    );
  end loop;
end $$;

revoke execute on function public.psr_is_admin() from public, anon;
grant execute on function public.psr_is_admin() to authenticated;
