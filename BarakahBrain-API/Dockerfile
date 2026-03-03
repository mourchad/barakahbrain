# simple Dockerfile for BarakahBrain API
# use a node base with Alpine for small size; switch to "-slim" if
# native compilation dependencies give trouble.
FROM node:18-alpine

# set working directory
WORKDIR /usr/src/app

# copy package manifests (lockfile optional) to leverage layer caching
COPY package*.json ./

# install production deps; fall back to "npm install" if there is no
# lockfile, since "npm ci" insists on one.
RUN if [ -f package-lock.json ]; then \
      npm ci --only=production; \
    else \
      npm install --only=production; \
    fi

# copy rest of the project files
COPY . .

# ensure writable database directory and drop root ownership
RUN mkdir -p /data && chown -R node:node /usr/src/app /data

# note: Railway forbids the VOLUME instruction in Dockerfiles —
# volumes must be configured in the Railway UI. We keep the
# directory creation and ownership so the container can write to it.

# run as an unprivileged user for security
USER node

ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
