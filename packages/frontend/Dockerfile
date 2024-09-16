# Repo: @johnforfar/customer-intent-dashboard File: /packages/frontend/Dockerfile

FROM node:14

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Use build argument for REACT_APP_API_URL
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

EXPOSE 3000

CMD ["npm", "start"]