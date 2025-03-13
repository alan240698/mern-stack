FROM node:20 AS base

# Set working directory inside the container
WORKDIR /app

# Copy package.json and yarn.lock (or package-lock.json if using npm)
COPY package*.json ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the source code
COPY . .

# Create .next directory and set correct permissions BEFORE switching users
RUN [ ! -d "/app/.next/cache" ] && mkdir -p /app/.next/cache || true && \
    [ ! -d "/app/.next/trace" ] && mkdir -p /app/.next/trace || true && \
    chmod -R 777 /app/.next && \
    chown -R node:node /app/.next

# Change ownership of the working directory to the non-root user
RUN chown -R node:node /app

# Switch to the non-root user (built-in 'node' user in the Node.js image)
USER node

# Expose the port
EXPOSE 3001

# Start Next.js in development mode
CMD ["yarn", "dev", "-p", "3001"]