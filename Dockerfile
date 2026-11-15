# Production-only dependencies (used by the runtime image)
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --omit=dev --no-audit --no-fund --prefer-offline --legacy-peer-deps

# Full dependencies (incl. devDeps like typescript/tailwind) + build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --no-audit --no-fund --prefer-offline --legacy-peer-deps
COPY . .
ARG NEXT_PUBLIC_ASSET_BASE
ENV NEXT_PUBLIC_ASSET_BASE=$NEXT_PUBLIC_ASSET_BASE
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
