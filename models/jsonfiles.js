var mongoose = require('../connection');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var fileSchema = new Schema({
    jsonfiles:[{
        filename:String,
        url: String
    }],
    user:{type:ObjectId,ref:'User',required:true,unique:true,ensureIndex:true}
});

module.exports = mongoose.model('Jsonfile', fileSchema);