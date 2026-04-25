# frontend/Dockerfile

# Use the official Bun image
FROM oven/bun:1 AS base

# Set working directory
WORKDIR /app

# Copy package.json and bun.lock files
COPY package.json bun.lock ./

# Install dependencies using bun
RUN bun install

# Copy the rest of the frontend code
COPY . .

# Expose Vite's default port
EXPOSE 5173

# Run the Vite development server
# --host is required to expose the server outside the Docker container
CMD ["bun", "run", "dev", "--host"]
