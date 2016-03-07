var fs = require('fs');
var glob = require("glob");
var regexComments = /\/\/.+/g;

var regexRest = /\W+|\d|var|function|scope|www|app|angular|module|main|define/g


var cleanOb, word, file;

var dataClear =[];

var directory = "../../vivo-client/public/app/";
var options = {cwd: directory};

var files = glob.sync("**/**/*.js", options);


exports.startAll = function (){
	return eachFile(files);
};

function eachFile (list) {
	for (var i = 0; i < list.length; i++) {
		var path = directory + list[i];
		file = fs.readFileSync(path, 'utf8');
		return parseFile(file);
	};
};

function parseFile (data) {
	var noComments = cleanString(data, regexComments, "");
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
	for (var key in data) {
		if (data.hasOwnProperty(key)) {
     		dataClear.push({"keyword": key,
     						"size": data[key],
     						"className": key.toLowerCase(),
     						"week": "add week value when saving to mongo"
     					});
		}
	}
	return createD3Obj(dataClear);	
};


function createD3Obj (data) {
	var sorted = data.sort(function(a,b) {
		return b.occured - a.occured
	});
	
	sorted = sorted.slice(0,10);
	return {children: sorted};
}

function cleanString (string, regex, subst) {
	return string.replace(regex, subst);
};

function isNotEmpty (value) {
	if (value !== "" && value !== "_") {
		return true
	}
};