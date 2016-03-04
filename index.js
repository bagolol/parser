var express = require('express');
var app = express();
var path = require('path');
var data = require('./app');

 var options = {
    root: __dirname + '/views/',
  };


app.get('/', function(req, res) {
  res.sendFile('index2.html', options);
});


app.get('/results', function(req, res) {
	var words = data.startAll();
	
	words = words.sort(function(a,b) {
		return b.occured - a.occured
	});
	
	words = words.slice(0,39);
	var allData = {children: words};
	res.send(allData);
});


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});