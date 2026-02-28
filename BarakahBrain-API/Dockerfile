# simple Dockerfile for BarakahBrain API
FROM node:18-alpine

# set working directory
WORKDIR /usr/src/app

# copy package files first for caching
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# copy rest of the files
COPY . .

# create database directory and ensure permissions
RUN mkdir -p /usr/src/app && chown -R node:node /usr/src/app

# allow non-root user
USER node

ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
