FROM node:22-bookworm-slim

ENV NODE_ENV=production

WORKDIR /rio/services/billing

# Billing dependencies
COPY services/billing/package.json services/billing/package-lock.json ./
RUN npm ci --omit=dev

# Billing source code
COPY services/billing/ ./

ENV PORT=8005

EXPOSE 8005

CMD ["npm", "start"]