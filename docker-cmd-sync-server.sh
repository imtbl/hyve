#!/bin/sh

stop() {
  pkill supercronic
  sleep 1
}

trap "stop" SIGTERM

HYVE_DOCKER_CRON_SCHEDULE="${HYVE_DOCKER_CRON_SCHEDULE:=0 4 * * *}"

cd /usr/src/app/services/sync-server

cp .crontab.docker .crontab
envsubst < .env.docker > .env

touch $HYVE_CONTENT_DB_PATH
rm -f $(dirname "$HYVE_CONTENT_DB_PATH")/.sync-lock

sed -i "s~HYVE_DOCKER_CRON_SCHEDULE~$HYVE_DOCKER_CRON_SCHEDULE~g" .crontab

echo "Waiting 60 seconds before running initial sync…"
sleep 60

node bin/sync

supercronic .crontab &
wait $!
