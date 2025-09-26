# Build stage
FROM node:22-bookworm AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files from root
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json ./
COPY create-package.sh ./

# Copy all packages
COPY core/ ./core/
COPY aztec/ ./aztec/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build all packages in correct order
RUN pnpm -r build

# Runtime stage
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/aztec/example-dapp/dist /usr/share/nginx/html

# Note: Add custom nginx.conf if needed
# COPY aztec/example-dapp/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
