FROM node:20 AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package.json ./
ENV CI=true HUSKY=0
RUN npm install --legacy-peer-deps --no-audit --no-fund 2>&1 | tee /tmp/npm-install.log || (echo "=== FULL NPM ERROR ===" && ls -la /root/.npm/_logs/ 2>/dev/null && tail -n 300 /root/.npm/_logs/*-debug.log 2>/dev/null && exit 1)

FROM node:20 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
