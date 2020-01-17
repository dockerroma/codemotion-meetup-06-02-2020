
var express = require('express');
var app = express();
app.use(express.urlencoded())

MONGO_URL = "mongodb://admin:admin@localhost:27017"

// Connection to mongo database and defintion of object Guest
const mongoose = require('mongoose');
mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const Guest = mongoose.model('Guest', { name: String });

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

  renderMainPage((page) => res.send(page))

});

app.post('/', function (req, res) {

  // Create new guest
  const guest = new Guest({ name: req.body.guest });

  // Save it
  guest.save().then(() => {
    console.log("saved")

    // Render main page
    renderMainPage((page) => res.send(page))

  }).catch((err) => {
    console.log("Error")

    // Render main page
    renderMainPage((page) => res.send(page))
  })
  
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

