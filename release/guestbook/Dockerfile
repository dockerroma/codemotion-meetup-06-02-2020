FROM node:10

WORKDIR /app

COPY server.js /app/server.js
COPY package.json /app/package.json

RUN npm install 

ENTRYPOINT [ "node", "server.js" ]
