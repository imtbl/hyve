#!/bin/sh

if [[ $# -eq 0 ]]; then
  echo "No service selected, exiting."
  exit 1
fi

if [[ $1 = sync ]]; then
  stop() {
    pkill supercronic
    sleep 1
  }

  trap "stop" SIGTERM

  HYVE_DOCKER_CRON_SCHEDULE="${HYVE_DOCKER_CRON_SCHEDULE:=0 4 * * *}"

  cd /usr/src/app/services/sync
  cp .crontab.docker .crontab
  envsubst < .env.docker > .env
  sed -i "s~HYVE_DOCKER_CRON_SCHEDULE~$HYVE_DOCKER_CRON_SCHEDULE~g" .crontab
  echo "Waiting 60 seconds before running initial sync…"
  sleep 60
  node bin/sync
  supercronic .crontab &
  wait $!
elif [[ $1 = server ]]; then
  stop() {
    pkill node
    sleep 1
  }

  trap "stop" SIGTERM

  cd /usr/src/app/services/server
  envsubst < .env.docker > .env
  touch $HYVE_AUTHENTICATION_DB_PATH
  touch $HYVE_CONTENT_DB_PATH
  yarn migrate
  node bin/www &
  wait $!
elif [[ $1 = web ]]; then
  stop() {
    pkill node
    sleep 1
  }

  trap "stop" SIGTERM

  cd /usr/src/app/services/web
  envsubst < .env.docker > .env
  yarn build
  yarn start &
  wait $!
else
  echo "No service selected, exiting."
  exit 1
fi
