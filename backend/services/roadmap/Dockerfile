FROM node:22-bookworm-slim

ENV NODE_ENV=production

WORKDIR /rio/services/roadmap

# Roadmap dependencies
COPY services/roadmap/package.json services/roadmap/package-lock.json ./
RUN npm ci --omit=dev

# Roadmap source code
COPY services/roadmap/ ./

ENV PORT=8004

EXPOSE 8004

CMD ["npm", "start"]