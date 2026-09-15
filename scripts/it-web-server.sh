#!/usr/bin/env sh
set -eu

docker compose up -d --build

fe_port=${S5_FE_PORT:-3100}
be_port=${S5_BE_PORT:-8180}

until curl --fail --silent "http://localhost:${be_port}/ready" >/dev/null; do
  sleep 1
done

until curl --fail --silent "http://localhost:${fe_port}/masuk" >/dev/null; do
  sleep 1
done

while :; do
  sleep 30
done
