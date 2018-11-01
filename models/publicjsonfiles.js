var mongoose = require('../connection');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var fileSchema = new Schema({

    jsonfiles:[{
        filename:String,
        url: String
    }]

});

module.exports = mongoose.model('Publicjsonfile', fileSchema);