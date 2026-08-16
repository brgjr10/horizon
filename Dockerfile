FROM node:20 AS runner
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
ENV CI=true HUSKY=0
RUN npm install --legacy-peer-deps --no-audit --no-fund --ignore-scripts

COPY . .

RUN npm run build

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

RUN chown -R nextjs:nodejs /app

USER nextjs
EXPOSE 3000
CMD ["npm", "run", "start"]
