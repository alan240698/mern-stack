# Use latest Node.js LTS as base image
FROM node:20 AS base

# Set working directory inside the container
WORKDIR /app

# Copy dependencies before copying source code to optimize caching
COPY package*.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy entire source code
COPY . .

# Build the application
RUN yarn build

# Ensure correct permissions
RUN chmod -R 777 /app/dist && chown -R node:node /app

# Use a non-root user
USER node
EXPOSE 3000

# Default command will be overwritten in docker-compose.yml
CMD ["yarn", "start:dev"]
