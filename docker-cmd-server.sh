#!/bin/sh

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
