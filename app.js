var fs = require('fs')
var regexComments = /\/\/.+/g;
var regexRest = /\W+|\d|var|function|www|app|angular|module|main|define/g

var cleanOb = {};
var word;
var dataClear = [];


var test = fs.readFileSync('./tags.js', 'utf8');

exports.startAll = function () {
	console.log(test);
	return parseFile(test);
};

function parseFile (data) {
	var noComments = cleanString(data, regexComments, '');
	var noRepetitions = cleanString(noComments, regexRest, ",");
	return stringToArray(noRepetitions);	
};

function stringToArray (list) {
	var words = list.split(',');
	var cleanList = words.filter(isNotEmpty);
	return countWords(cleanList);
};

function countWords (words) {
	for (var i = 0; i < words.length; i++) {
		word = words[i];

		if (!cleanOb.hasOwnProperty(word)) {
			cleanOb[word] = 1; 
		} else {
			cleanOb[word] += 1;
		}		
	}
	return createData(cleanOb);
};

function createData (data) {
	for (var key in data) {
		if (data.hasOwnProperty(key)) {
     		dataClear.push({"word": key, "occured": data[key]})
		}
	}
	return dataClear;	
};


function cleanString (string, regex, subst) {
	return string.replace(regex, subst);
};

function isNotEmpty (value) {
	if (value !== "" && value !== "_") {
		return true
	}
};