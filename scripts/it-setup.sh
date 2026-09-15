#!/usr/bin/env sh
set -eu

cleanup() {
  if [ "${IT_KEEP_COMPOSE:-false}" != "true" ]; then
    docker compose down --remove-orphans
  fi
}
trap cleanup EXIT INT TERM

docker compose up -d --build

fe_port=${S5_FE_PORT:-3100}
be_port=${S5_BE_PORT:-8180}
until curl --fail --silent "http://localhost:${be_port}/ready" >/dev/null; do sleep 1; done
until curl --fail --silent "http://localhost:${fe_port}/masuk" >/dev/null; do sleep 1; done

npm run test:e2e:integration -- "$@"
