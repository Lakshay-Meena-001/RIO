FROM node:22-bookworm-slim

ENV NODE_ENV=production

WORKDIR /rio

# Root dependencies needed by shared Redis module
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Resume dependencies
COPY services/resume/package.json services/resume/package-lock.json ./services/resume/
WORKDIR /rio/services/resume
RUN npm ci --omit=dev

# Resume source and shared modules
COPY services/resume/ /rio/services/resume/
COPY shared/ /rio/shared/

ENV PORT=8002

EXPOSE 8002

CMD ["npm", "start"]