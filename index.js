var express = require('express');
var app = express();
var path = require('path');
var Blob = require('./dbModel');


var options = {
    root: __dirname + '/views/',
};

app.use(express.static('public'));

app.get('/', function(req, res) {
	res.sendFile('index2.html', options);
});


app.get('/results', function(req, res) {
	Blob.findOne({'week': 6}, function (err, docs){
		res.send(docs.keywords);
	});	
});


app.listen(3000, function () {
	console.log('Example app listening on port 3000!');
});