var mongoose = require('mongoose');

// connect to database
mongoose.connect('mongodb://localhost/vivo');


var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


var myPersonalSchema = new Schema ({
	keywords: Array,
	week: Number
});


var Blob = mongoose.model('Blob', myPersonalSchema);

module.exports = Blob;


