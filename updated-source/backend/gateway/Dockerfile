
FROM node:22-bookworm-slim

ENV NODE_ENV=production

WORKDIR /rio

# Root backend dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Gateway dependencies
COPY gateway/package.json gateway/package-lock.json ./gateway/
WORKDIR /rio/gateway
RUN npm ci --omit=dev

# Gateway source and shared modules
COPY gateway/ ./
COPY shared/ /rio/shared/

ENV PORT=8000

EXPOSE 8000

CMD ["npm", "start"]
