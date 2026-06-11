FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev

# 1. Copia o código compilado do TypeScript
COPY --from=builder /app/dist ./dist

# 2. adding the index.html
COPY --from=builder /app/public ./public

USER node

EXPOSE 3000

CMD ["node", "dist/app.js"]