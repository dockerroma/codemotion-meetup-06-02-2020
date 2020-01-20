serverPort = 3005

var express = require('express');
var app = express();
app.use(express.urlencoded())

// MONGO_URL = "mongodb://admin:admin@192.168.1.114:27017"
MONGO_URL = "mongodb://admin:admin@mongo:27017"

// Connection to mongo database and defintion of object Guest
const mongoose = require('mongoose');
mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const Guest = mongoose.model('Guest', { name: String });

// Init
const Prometheus = require('prom-client')
const httpRequestDurationMicroseconds = new Prometheus.Histogram({
   name: 'http_request_duration_ms',
   help: 'Duration of HTTP requests in ms',
   labelNames: ['route'],
   // buckets for response time from 0.1ms to 2000ms
   buckets: [0.10, 5, 15, 50, 100, 200, 300, 400, 500, 1000, 2000]
})

/**
 * @param {*} response Method to be invoked with the rendered page
 */
function renderMainPage(res) {

  Guest.find({}, function (err, guests) {

    page = "<html><body>"

    page += "<h1>Guestbook</h1>"

    page += "<form method='POST'>"
    page += "<input type='text' name='guest' />"
    page += "<input type='submit' value='add guest'/>"
    page += "</form>"

    page += "<h3>Guests</h3>"

    if (err) {
      console.log(err);
      page += "<br/>"
      page += "<h2>Guests</h2>"
    }
    else {
      page += "<ul>"
      page += guests.map(x => "<li>" + x.name + "</li>").join("<br/>")
      page += "</ul>"
    }

    res(page);

  })

}

app.get('/', function (req, res) {
  // Begin of each response
  var hrstart = process.hrtime()

  renderMainPage((page) => res.send(page))

  // After each response
  hrend = process.hrtime(hrstart)
  responseTimeInMs = hrend[0] * 1000 + hrend[1] / 1000
  httpRequestDurationMicroseconds.labels(req.route.path).observe(responseTimeInMs)
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
   res.set('Content-Type', Prometheus.register.contentType)
   res.end(Prometheus.register.metrics())
})

app.post('/', function (req, res) {

  // Begin of each response
  var hrstart = process.hrtime()

  // Create new guest
  const guest = new Guest({ name: req.body.guest });

  // Save it
  guest.save().then(() => {
    console.log("saved:", guest)

    // Render main page
    renderMainPage((page) => res.send(page))

    // After each response
    hrend = process.hrtime(hrstart)
    responseTimeInMs = hrend[0] * 1000 + hrend[1] / 1000
    httpRequestDurationMicroseconds.labels(req.route.path).observe(responseTimeInMs)

  }).catch((err) => {
    console.log("Error")

    // Render main page
    renderMainPage((page) => res.send(page))

    // After each response
    hrend = process.hrtime(hrstart)
    responseTimeInMs = hrend[0] * 1000 + hrend[1] / 1000
    httpRequestDurationMicroseconds.labels(req.route.path).observe(responseTimeInMs)

  })
  
})

app.listen(serverPort, function () {
  console.log('Example app listening on port ' + serverPort +  '!');
});
