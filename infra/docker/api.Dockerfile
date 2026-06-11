FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

RUN npm install

# Build the API
COPY . .
WORKDIR /app/apps/api
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
