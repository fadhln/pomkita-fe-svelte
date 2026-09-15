-- S5 keeps one locked report as a read fixture.
-- It also keeps one pending amendment for the governance reject case.
begin;

insert into public.audit_chain_locks (org_id)
values ('11111111-1111-4111-8111-111111111111')
on conflict (org_id) do nothing;

insert into public.shifts (
  shift_id, org_id, station_id, station_seq, supervisor_id, opened_at,
  timezone_snapshot, business_date, status, backfilled, shift_price_map_snapshot,
  shift_price_map_hash
)
values (
  '12121212-1212-4121-8121-121212121212',
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  1,
  '66666666-6666-4666-8666-666666666666',
  timestamptz '2026-09-14 00:00:00+00',
  'Asia/Jakarta',
  '2026-09-14',
  'locked',
  false,
  '{"hash_version":1,"items":[]}'::jsonb,
  decode(repeat('00', 32), 'hex')
)
on conflict (shift_id) do nothing;

insert into public.policy_snapshot_sets (set_id, org_id, station_id, shift_id)
values (
  '14141414-1414-4141-8141-141414141414',
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '12121212-1212-4121-8121-121212121212'
)
on conflict (set_id) do nothing;

insert into public.shift_reports (
  report_id, org_id, station_id, shift_id, version_no, status,
  submitted_by, submitted_at, policy_snapshot_set_id
)
values (
  '13131313-1313-4131-8131-131313131313',
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '12121212-1212-4121-8121-121212121212',
  1,
  'locked',
  '66666666-6666-4666-8666-666666666666',
  timestamptz '2026-09-14 04:00:00+00',
  '14141414-1414-4141-8141-141414141414'
)
on conflict (report_id) do nothing;

update public.shifts
set current_report_id = '13131313-1313-4131-8131-131313131313'
where shift_id = '12121212-1212-4121-8121-121212121212';

insert into public.amendments (
  amendment_id, org_id, station_id, shift_id, base_report_id, reason,
  status, requester_user_id, stale_check_hash, is_break_glass
)
values (
  '15151515-1515-4151-8151-151515151515',
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '12121212-1212-4121-8121-121212121212',
  '13131313-1313-4131-8131-131313131313',
  'Koreksi nilai penjualan untuk pemeriksaan integrasi.',
  'pending',
  '66666666-6666-4666-8666-666666666666',
  decode(repeat('11', 32), 'hex'),
  false
)
on conflict (amendment_id) do nothing;

insert into public.amendment_items (
  item_id, amendment_id, org_id, station_id, shift_id,
  target_kind, target_logical_id, field, old_value, new_value
)
values (
  '16161616-1616-4161-8161-161616161616',
  '15151515-1515-4151-8151-151515151515',
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '12121212-1212-4121-8121-121212121212',
  'sales_declared',
  '17171717-1717-4171-8171-171717171717',
  'cash_amount',
  '2000'::jsonb,
  '2500'::jsonb
)
on conflict (item_id) do nothing;

commit;
