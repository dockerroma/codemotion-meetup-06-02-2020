# Launch mongdb
docker run \
    --name mongo \
    --rm \
    -p 20017:20017 \
    -e MONGO_INITDB_ROOT_USERNAME=admin \
    -e MONGO_INITDB_ROOT_PASSWORD=admin \
    mongo    
//--------------------------------------
// Dockerfile per guestbook
/*
FROM node:10

WORKDIR /app

COPY server.js /app/server.js
COPY package.json /app/package.json
COPY views /app/views

RUN npm install 

ENTRYPOINT [ "node", "server.js" ]
*/
//--------------------------------------
// Build guestbook
docker build -t guestbook .
//--------------------------------------
// Run guestbook
docker run --name guestbook --rm -p 3005:3005 guestbook
//--------------------------------------
// get-my-ip to obtain ip
//--------------------------------------
// Creazione docker compose: docker-compose.yaml
version: '3.1'

services:

  mongo:
    image: mongo
    restart: always
    ports:
      - 27017:27017
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin

  guestbook:
    restart: always
    ports:
      - 3005:3005
    image: guestbook
    depends_on:
      - "mongo"

// Ripara la MONGO_URL con il valore interno

MONGO_URL = "mongodb://admin:admin@mongo:27017"

//--------------------------------------
docker-compose up --build
//--------------------------------------
// Aggiunta di mongo express
/*
  mongo-express:
    image: mongo-express
    restart: always
    ports:
      - 8081:8081
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: admin
      ME_CONFIG_MONGODB_ADMINPASSWORD: admin
    depends_on:
      - "mongo"
*/
//--------------------------------------
// Mini CI/CD pipeline
/*
  guestbook:
    restart: always
    ports:
      - 3005:3005
    build:
      context: ./guestbook
      dockerfile: Dockerfile
    depends_on:
      - "mongo"
*/
//--------------------------------------
// Instrument the code
// Add to package.json
/*
"prom-client": "^11.5.3",
*/

// Init
const Prometheus = require('prom-client')
const httpRequestDurationMicroseconds = new Prometheus.Histogram({
   name: 'http_request_duration_ms',
   help: 'Duration of HTTP requests in ms',
   labelNames: ['route'],
   // buckets for response time from 0.1ms to 2000ms
   buckets: [0.10, 5, 15, 50, 100, 200, 300, 400, 500, 1000, 2000]
})

// Instrument code
// Metrics endpoint
app.get('/metrics', (req, res) => {
    res.set('Content-Type', Prometheus.register.contentType)
    res.end(Prometheus.register.metrics())
 })

  // Begin of each response
  var hrstart = process.hrtime()

      // After each response
      hrend = process.hrtime(hrstart)
      responseTimeInMs = hrend[0] * 1000 + hrend[1] / 1000000
      httpRequestDurationMicroseconds.labels(req.route.path).observe(responseTimeInMs)

//--------------------------------------
// COPIARE ANCHE IL FILE prometheus.yaml
//--------------------------------------
// Prometheus
/*
  prometheus:
    image: prom/prometheus
    restart: always
    volumes:
    - ./prometheus.yaml:/etc/prometheus/prometheus.yml
    ports:
      - 9090:9090
    depends_on:
      - "guestbook"
*/

//--------------------------------------
/*
  grafana:
    image: grafana/grafana
    restart: always
    volumes:
    - ./config.ini:/etc/grafana/config.ini
    - ./dashboards:/var/lib/grafana/dashboards
    - ./provisioning:/etc/grafana/provisioning
    ports:
      - 3000:3000
    depends_on:
      - "prometheus"
*/

//--------------------------------------
// COPIARE ANCHE I file 
// * config.ini
// * provisioning
// * dashboards
//--------------------------------------
