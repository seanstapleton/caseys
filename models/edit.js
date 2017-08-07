var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var editSchema = new Schema({
    author: String,
    author_id: String,
    description: String,
    date_time: String,
    edited_items: Array
})

module.exports = mongoose.model('Edit', editSchema);
