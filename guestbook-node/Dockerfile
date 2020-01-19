FROM node:10

WORKDIR /app

COPY server.js /app/server.js
COPY package.json /app/package.json

RUN npm install 

# EXPOSE 3005

# RUN apt-get update \
#     apt-get install -y nodejs nodejs-legacy npm
# RUN npm install -g express-generator

ENTRYPOINT [ "node", "server.js" ]
