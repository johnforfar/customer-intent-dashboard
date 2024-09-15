# Repo: @johnforfar/customer-intent-dashboard File: /packages/backend/Dockerfile

FROM node:18

WORKDIR /app

# Copy the root package.json and lerna.json
COPY package.json lerna.json ./

# Copy the backend package
COPY packages/backend ./packages/backend

# Install dependencies
RUN npm install
RUN npm install esbuild @aws-sdk/client-dynamodb express

# Build the backend
WORKDIR /app/packages/backend
RUN npm run build

EXPOSE 4000

CMD ["node", "dist/server.js"]