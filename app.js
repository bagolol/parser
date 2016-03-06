var fs = require('fs')
var regexComments = /\/\/.+/g;
var regexRest = /\W+|\d|var|function|scope|www|app|angular|module|main|define/g

var cleanOb;
var word;
var dataClear;


var test = fs.readFileSync('./tags.js', 'utf8');

exports.startAll = function () {
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
	cleanOb = {};
	for (var i = 0; i < words.length; i++) {
		word = words[i];
		// word = cleanString(words[i], /[s]$/, "")

		if (!cleanOb.hasOwnProperty(word)) {
			cleanOb[word] = 1;
		} else {
			cleanOb[word] += 1;
		}
	}
	return createData(cleanOb);
};

function createData (data) {
	dataClear = [];
	for (var key in data) {
		if (data.hasOwnProperty(key)) {
     		dataClear.push({"name": key,
     						"size": data[key],
     						"className": key.toLowerCase()});
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