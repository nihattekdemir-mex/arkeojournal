# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json package-lock.json* pnpm-lock.yaml* ./

RUN npm install --legacy-peer-deps

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

RUN npm install -g pnpm

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY package.json package-lock.json* pnpm-lock.yaml* ./

RUN npm install --legacy-peer-deps --production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["npm", "start"]
