var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var applicantSchema = new Schema({
    first_name: String,
    last_name: String,
    phnum: String,
    email: String,
    position: String,
    message: String
  });

module.exports = mongoose.model('Applicant', applicantSchema);
