var express = require('express');
var app = express();
var path = require('path');
var data = require('./app');

 var options = {
    root: __dirname + '/views/',
  };

app.use(express.static('public'));


app.get('/', function(req, res) {
  res.sendFile('index2.html', options);
});


app.get('/results', function(req, res) {
	var D3Obj = data.startAll();
	res.send(D3Obj);
});


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});