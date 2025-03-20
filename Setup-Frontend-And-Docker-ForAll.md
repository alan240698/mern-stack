## [**NextJs and Docker**](https://medium.com/@imahmudul/powering-your-app-unleashing-the-potential-of-nestjs-mongodb-redis-nextjs-and-docker-106afe2aab3)

---

### Setting up NextJS Frontend

```plaintext
npx create-next-app frontend
cd frontend
yarn dev -p 3001
```

**Update** `page.tsx` **file:**

```plaintext
"use client"
import { useEffect, useState } from 'react';

export default function Home() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:3000/demo');
      const jsonData = await response.json();
      setData(jsonData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
```

\=> Now Navigating to `http://localhost:3001`Reload the tab you should see `fromCache` flag has been update to `true`

---

**docker-compose.yml**

```plaintext
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: backend
    ports:
      - '3000:3000'
    volumes:
      - ./backend/src:/app/src  # Chỉ mount src, tránh lỗi mất node_modules
      - ./backend/.env.development.local:/app/.env.development.local
    env_file:
      - ./backend/.env.development.local
    depends_on:
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: ["yarn", "start:dev"]

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: frontend
    ports:
      - '3001:3001'
    volumes:
      - ./frontend/src:/app/src
      - ./frontend/.next:/app/.next  # Giữ cache giúp Next.js build nhanh hơn
    depends_on:
      - backend

  mongodb:
    image: mongo
    container_name: mongo_db
    restart: always
    ports:
      - '27017:27017'
    volumes:
      - mongo_data:/data/db
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh mongo_db:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7.4.2
    container_name: redis_cache
    restart: always
    ports:
      - "127.0.0.1:6379:6379"  # Chỉ mở Redis cho localhost để tránh tấn công
    volumes:
      - redis_data:/data
      - ./backend/redis.conf:/usr/local/etc/redis/redis.conf
    command: ["redis-server", "/usr/local/etc/redis/redis.conf"]
    environment:
      - REDIS_PASSWORD=strongpassword
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "strongpassword", "ping"]
      interval: 10s
      retries: 3
      start_period: 5s

  redis-insight:
    image: redislabs/redisinsight:latest
    container_name: redis_insight
    restart: always
    ports:
      - "8001:8001"
    depends_on:
      redis:
        condition: service_healthy
    volumes:
      - redis_insight_data:/db
    command: >
      bash -c "sysctl -w net.core.somaxconn=1024 && /entrypoint.sh"

volumes:
  mongo_data:
  redis_data:
  redis_insight_data:
```

**backend/Dockerfile**

```plaintext
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

```

**frontend/Dockerfile**

```plaintext
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
```

\=> **docker-compose up --build -d**