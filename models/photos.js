var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var photosSchema = new Schema({
    src: String,
    thumbnail: String,
    caption: String
});

module.exports = mongoose.model('Photo', photosSchema);
