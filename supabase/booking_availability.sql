create or replace view public.booking_availability as
select
  b.booking_date,
  left(cast(b.booking_time as text), 5) as booking_time,
  coalesce(b.duration, 30) as duration,
  coalesce(b.standard_simulators, 0) as standard_simulators,
  coalesce(b.pro_simulators, 0) as pro_simulators,
  coalesce(
    b.simulators,
    coalesce(b.standard_simulators, 0) + coalesce(b.pro_simulators, 0)
  ) as simulators,
  b.booking_type,
  b.reservation_kind,
  case
    when coalesce(b.standard_simulators, 0) >= 2 and coalesce(b.pro_simulators, 0) >= 1 then '3_SIMULADORES'
    when coalesce(b.standard_simulators, 0) = 1 and coalesce(b.pro_simulators, 0) = 1 then '1_ESTANDAR_1_PRO'
    when coalesce(b.standard_simulators, 0) >= 2 and coalesce(b.pro_simulators, 0) = 0 then '2_ESTANDAR'
    when coalesce(b.standard_simulators, 0) = 0 and coalesce(b.pro_simulators, 0) >= 1 then '1_PRO'
    when coalesce(b.standard_simulators, 0) = 1 and coalesce(b.pro_simulators, 0) = 0 then '1_ESTANDAR'
    when upper(coalesce(b.booking_type, '')) like '%1 ESTÁNDAR + 1 PRO%' then '1_ESTANDAR_1_PRO'
    when upper(coalesce(b.booking_type, '')) like '%2 ESTÁNDAR%' then '2_ESTANDAR'
    when upper(coalesce(b.booking_type, '')) like '%1 PRO%' then '1_PRO'
    when upper(coalesce(b.booking_type, '')) like '%1 ESTÁNDAR%' then '1_ESTANDAR'
    when coalesce(b.simulators, 0) >= 3 then '3_SIMULADORES'
    when coalesce(b.simulators, 0) = 2 then '1_ESTANDAR_1_PRO'
    when coalesce(b.simulators, 0) = 1 then '1_ESTANDAR'
    else null
  end as simulator_config_id
from public.bookings b;

revoke all on public.booking_availability from public;
grant select on public.booking_availability to anon, authenticated;
