FROM node:18-alpine3.17
RUN apk add --no-cache dumb-init && adduser -D nuxtuser 
USER nuxtuser

WORKDIR /app
COPY --chown=nuxtuser:nuxtuser .output ./
EXPOSE 3000

ENV HOST=0.0.0.0 PORT=3000 NODE_ENV=production

CMD ["dumb-init","node","/app/server/index.mjs"]
