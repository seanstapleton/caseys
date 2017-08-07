var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var itemSchema = new Schema({
    title: String,
    desc: String,
    price: String,
    tags: Array,
    availabilities: Array,
    id: String
})

module.exports = mongoose.model('Item', itemSchema);
