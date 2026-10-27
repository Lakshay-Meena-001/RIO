FROM node:22-bookworm-slim

ENV NODE_ENV=production

WORKDIR /rio

# Root dependencies needed by shared Redis module
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Auth dependencies
COPY services/auth/package.json services/auth/package-lock.json ./services/auth/
WORKDIR /rio/services/auth
RUN npm ci --omit=dev

# Auth source and shared modules
COPY services/auth/ /rio/services/auth/
COPY shared/ /rio/shared/

ENV PORT=8001

EXPOSE 8001

CMD ["npm", "start"]