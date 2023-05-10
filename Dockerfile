FROM node:18 AS base
WORKDIR /app
RUN apt-get update && apt-get install dumb-init
RUN yarn global add pnpm
RUN mkdir -p /app/web-ui /app/src /app/tmp && chown -R node:node /app
USER node

# Frontend 
FROM base AS page-deps
WORKDIR /app/web-ui
COPY ./web-ui/package.json ./web-ui/pnpm-lock.yaml* ./
RUN pnpm i --frozen-lockfile

FROM base AS page-builder
USER node
WORKDIR /app/web-ui
COPY --from=page-deps /app/web-ui/node_modules ./node_modules
COPY ./web-ui .
RUN pnpm build

# Backend
FROM base AS deps
WORKDIR /app/src
COPY --chown=node:node ./src/package*.json ./src/pnpm-lock.yaml ./
RUN pnpm i --frozen-lockfile

FROM deps AS build
WORKDIR /app/src
COPY --chown=node:node ./src .
RUN node ace build --production

FROM base AS production
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=$PORT
ENV HOST=0.0.0.0
COPY --chown=node:node ./src/package*.json ./src/pnpm-lock.yaml ./
RUN pnpm i --frozen-lockfile --prod

# Add compiled js files
COPY --chown=node:node --from=build /app/src/build .
# Add frontend public assets
COPY --chown=node:node --from=page-builder /app/src/public ./public
EXPOSE $PORT
CMD [ "dumb-init", "node", "server.js" ]
