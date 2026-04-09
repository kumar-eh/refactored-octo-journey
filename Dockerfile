# ---------- Stage 1: Builder ----------
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production deps
RUN npm install --omit=dev

# Copy source code
COPY . .

# ---------- Stage 2: Runtime Image ----------
FROM node:18-alpine

WORKDIR /app

# Copy only what's needed for runtime
COPY --from=builder /app /app

# Expose the service port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]