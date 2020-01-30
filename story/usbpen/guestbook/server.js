serverPort = 3005

var express = require('express');
var app = express();

app.use(express.urlencoded())
app.set('view engine', 'pug')

MONGO_URL = "mongodb://admin:fake_paswd@where.are.our.data:27017"

// Connection to mongo database and defintion of object Guest
const mongoose = require('mongoose');
mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const Guest = mongoose.model('Guest', { name: String });

app.get('/', function (req, res) {

  Guest.find({}, function (err, guests) {
    guests = guests.map(x => x.name)
    res.render('index', { list: guests })
  })

});

app.post('/', function (req, res) {

  // Create new guest
  const guest = new Guest({ name: req.body.guest });

  // Save it
  guest.save().then(() => {
    console.log("saved:", req.body.guest)

    Guest.find({}, function (err, guests) {
      guests = guests.map(x => x.name)
      res.render('index', { list: guests })
    })

  }).catch((err) => {
    console.log("Error on:", req.body.guest)

    Guest.find({}, function (err, guests) {
      guests = guests.map(x => x.name)
      res.render('index', { list: guests })
    })
  })
})

app.get('/old', function (req, res) {

  setTimeout(() => {

    Guest.find({}, function (err, guests) {
      guests = guests.map(x => x.name)
      res.render('index', { list: guests })
    })
    
  }, 600)
})

app.listen(serverPort, function () {
  console.log('Example app listening on port ' + serverPort +  '!');
});
