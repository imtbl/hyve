#!/bin/sh

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
