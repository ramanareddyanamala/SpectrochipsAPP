var mongoose = require('../connection');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var UserSchema = new Schema({
    username: String,
    userID: { type: String,required: true, index: { unique: true, sparse: true }}
});

module.exports = mongoose.model('User', UserSchema);