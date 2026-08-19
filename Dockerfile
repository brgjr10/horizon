FROM node:20 AS runner
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
ENV CI=true HUSKY=0
RUN npm install --legacy-peer-deps --no-audit --no-fund --ignore-scripts

COPY . .

ENV NEXT_PUBLIC_APPWRITE_ENDPOINT=http://appwrite:80/v1
ENV NEXT_PUBLIC_APPWRITE_PROJECT=8612be5b4d9a373fda49
ENV APPWRITE_DATABASE_ID=horizonDB
ENV APPWRITE_USER_COLLECTION_ID=users
ENV APPWRITE_BANK_COLLECTION_ID=banks
ENV APPWRITE_TRANSACTION_COLLECTION_ID=transactions
ENV NEXT_APPWRITE_KEY=2/wcnH7QxBwunsFgE5azN9KUfQw6c8VQdhDn7TRLhmU=
ENV PLAID_CLIENT_ID=69dfb325b85ed8000d5963e0
ENV PLAID_SECRET=44cfd1b3dbd40d72ec34b860d42850
ENV PLAID_ENV=sandbox
ENV DWOLLA_KEY=RROXFD0nRaoxxjslimqxlTZNdtPEWDu3lrc3pC4DxRReffyi2u
ENV DWOLLA_SECRET=g218GOMttnsNHEBGDoN0ElmjlzoRY0wsCf58bHM528HfNaDrh5
ENV DWOLLA_BASE_URL=https://api-sandbox.dwolla.com
ENV DWOLLA_ENV=sandbox

RUN npm run build

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

RUN chown -R nextjs:nodejs /app

USER nextjs
EXPOSE 3000
CMD ["npm", "run", "start"]
