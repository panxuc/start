FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
RUN corepack enable

RUN addgroup -S nextjs && adduser -S nextjs -G nextjs
COPY --from=builder --chown=nextjs:nextjs /app ./
RUN mkdir -p /app/data && chown -R nextjs:nextjs /app/data

USER nextjs
EXPOSE 3000
CMD ["pnpm", "start"]
