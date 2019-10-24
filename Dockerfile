FROM mhart/alpine-node:13

ARG HOST_USER_ID=1000
ARG HOST_GROUP_ID=1000

ENV \
  HOST_USER_ID=$HOST_USER_ID \
  HOST_GROUP_ID=$HOST_GROUP_ID \
  SUPERCRONIC_URL=https://github.com/aptible/supercronic/releases/download/v0.1.9/supercronic-linux-amd64 \
  SUPERCRONIC=supercronic-linux-amd64 \
  SUPERCRONIC_SHA1SUM=5ddf8ea26b56d4a7ff6faecdd8966610d5cb9d85

RUN \
  if [ $(getent group ${HOST_GROUP_ID}) ]; then \
    adduser -D -u ${HOST_USER_ID} hydrus; \
  else \
    addgroup -g ${HOST_GROUP_ID} hydrus && \
    adduser -D -u ${HOST_USER_ID} -G hydrus hydrus; \
  fi

WORKDIR /usr/src/app

COPY . .

RUN \
  apk --no-cache add \
    build-base \
    curl \
    gettext \
    python && \
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
    python && \
  chown -R hydrus:hydrus /usr/src/app && \
  mkdir /data && chown -R hydrus:hydrus /data

COPY docker-entrypoint.sh /usr/local/bin/start
RUN chmod +x /usr/local/bin/start

USER hydrus

ENTRYPOINT ["/usr/local/bin/start"]
CMD ["server"]
