# Repo: @johnforfar/customer-intent-dashboard File: /packages/frontend/Dockerfile

FROM node:14

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Set the environment variable
ENV REACT_APP_API_URL=http://localhost:4000

EXPOSE 3000

CMD ["npm", "start"]