FROM node:22-bookworm-slim

ENV NODE_ENV=production

WORKDIR /rio/services/interview

# Interview dependencies
COPY services/interview/package.json services/interview/package-lock.json ./
RUN npm ci --omit=dev

# Interview source code
COPY services/interview/ ./

ENV PORT=8003

EXPOSE 8003

CMD ["npm", "start"]