FROM node:18-alpine AS builder

WORKDIR /app

COPY .yarn/ ./.yarn/
COPY .yarnrc.yml ./
COPY package.json yarn.lock ./

COPY gateway-server/package.json ./gateway-server/
COPY auth-server/package.json ./auth-server/
COPY event-server/package.json ./event-server/

COPY . .

RUN yarn workspaces foreach --all run build

FROM node:18-alpine AS gateway
WORKDIR /app
COPY --from=builder /app/.yarn/ ./.yarn/
COPY --from=builder /app/.yarnrc.yml ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/.pnp.cjs ./
COPY --from=builder /app/.pnp.loader.mjs ./
COPY --from=builder /app/gateway-server/ ./gateway-server/
WORKDIR /app/gateway-server
CMD ["yarn", "start:prod"]

FROM node:18-alpine AS auth
WORKDIR /app
COPY --from=builder /app/.yarn/ ./.yarn/
COPY --from=builder /app/.yarnrc.yml ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/.pnp.cjs ./
COPY --from=builder /app/.pnp.loader.mjs ./
COPY --from=builder /app/auth-server/ ./auth-server/
WORKDIR /app/auth-server
CMD ["yarn", "start:prod"]

FROM node:18-alpine AS event
WORKDIR /app
COPY --from=builder /app/.yarn/ ./.yarn/
COPY --from=builder /app/.yarnrc.yml ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/.pnp.cjs ./
COPY --from=builder /app/.pnp.loader.mjs ./
COPY --from=builder /app/event-server/ ./event-server/
WORKDIR /app/event-server
CMD ["yarn", "start:prod"]
