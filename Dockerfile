# -------- STAGE 1: Build --------
FROM node:18-alpine AS builder

WORKDIR /app

# Install dev dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY tsconfig.build.json ./
COPY src ./src
RUN pnpm run build


# -------- STAGE 2: Production --------
FROM node:18-alpine

WORKDIR /app

# Copy built code from builder stage
COPY --from=builder /app/dist ./dist
COPY package.json pnpm-lock.yaml ./
COPY .env ./

# Install prod dependencies
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile
RUN pnpm add dotenv

# Start production server
EXPOSE 3001
CMD ["node", "dist/index.js"]
