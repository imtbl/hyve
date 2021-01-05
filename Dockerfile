FROM mhart/alpine-node:15

ARG USER_ID=1000
ARG GROUP_ID=1000

ENV \
  USER_ID=$USER_ID \
  GROUP_ID=$GROUP_ID \
  SUPERCRONIC_URL=https://github.com/aptible/supercronic/releases/download/v0.1.11/supercronic-linux-amd64 \
  SUPERCRONIC=supercronic-linux-amd64 \
  SUPERCRONIC_SHA1SUM=a2e2d47078a8dafc5949491e5ea7267cc721d67c

WORKDIR /usr/src/app

COPY . .

RUN \
  apk --no-cache add \
    build-base \
    curl \
    gettext \
    python3 && \
  curl -fsSLO "$SUPERCRONIC_URL" && \
  echo "${SUPERCRONIC_SHA1SUM}  ${SUPERCRONIC}" | sha1sum -c - && \
  chmod +x "$SUPERCRONIC" && \
  mv "$SUPERCRONIC" "/usr/local/bin/${SUPERCRONIC}" && \
  ln -s "/usr/local/bin/${SUPERCRONIC}" /usr/local/bin/supercronic && \
  yarn && \
  yarn bootstrap && \
  apk del \
    build-base \
    curl \
    python3 && \
  chown -R ${USER_ID}:${GROUP_ID} /usr/src/app && \
  mkdir /data && chown -R ${USER_ID}:${GROUP_ID} /data

COPY docker-cmd-sync-client.sh /usr/local/bin/sync-client
COPY docker-cmd-sync-server.sh /usr/local/bin/sync-server
COPY docker-cmd-server.sh /usr/local/bin/server
COPY docker-cmd-web.sh /usr/local/bin/web
RUN \
  chmod +x /usr/local/bin/sync-client && \
  chmod +x /usr/local/bin/sync-server && \
  chmod +x /usr/local/bin/server && \
  chmod +x /usr/local/bin/web

USER ${USER_ID}:${GROUP_ID}

CMD ["server"]
