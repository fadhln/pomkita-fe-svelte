#!/usr/bin/env sh
set -eu

docker compose exec -T postgres psql postgres://pomkita:pomkita@localhost:5432/pomkita_s5 -q -v ON_ERROR_STOP=1 -c "
set client_min_messages = warning;
do \$\$
declare
  table_list text;
begin
  select string_agg(format('public.%I', tablename), ', ' order by tablename)
    into table_list
    from pg_tables
    where schemaname = 'public'
      and tablename not in (
        'schema_migrations', 'organizations', 'stations', 'users',
        'user_station_roles', 'jwt_keys', 'dispensers', 'tanks', 'nozzles',
        'nozzle_tank_map', 'dispenser_nozzle_map', 'dispenser_prices',
        'threshold_policy_revisions', 'evidence_policy_revisions',
        'evidence_policy_types'
      );
  execute 'truncate table ' || table_list || ' cascade';
end
\$\$;
"

docker compose run --rm --no-deps -T seed >/dev/null
