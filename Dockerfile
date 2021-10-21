# Dockerfile

# base image
FROM nodejs-test-app-docker.repo.sebank.se/node:14-slim

# create & set working directory
WORKDIR /opt/node_app

# copy source files
COPY package.json ./

# install dependencies
#ENV YARN_CACHE_FOLDER=/dev/shm/yarn_cache
ENV YARN_CACHE_FOLDER=/opt/node_app/npm_cache
RUN npm install
RUN rm -rf /opt/node_app/npm_cache

# copy source files
COPY . .

RUN NEXT_TELEMETRY_DISABLED=1 npm run build

# start app
ENV NODE_ENV=production
EXPOSE 3000
CMD npm run start