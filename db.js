var mongoose = require('mongoose');

var url = 'mongodb://'+process.env.db_user+':'+process.env.db_pass+'@ds163718.mlab.com:63718/caseys';
mongoose.connect(url);

module.exports = mongoose.connection;
