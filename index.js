var express = require('express');
var app = express();
var path = require('path');
var data = require('./app');

app.use(express.static(path.join(__dirname, 'views')));

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function(req, res) {
  res.sendfile('index.html');
});


app.get('/results', function(req, res) {
  var test = data.startAll();
  console.log(test);
  res.send(test);
});


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});