module.exports = function(db, passport) {
    const express         = require('express');
    const router          = express.Router();
    const db              = require('../db');
    const bodyParser      = require('body-parser');
    const nodemailer      = require('nodemailer');
    const hoursSchema     = require('../models/hours.js');
    const menuSchema      = require('../models/menu.js');
    const eventsSchema    = require('../models/events.js');
    const specialsSchema  = require('../models/specials.js');
    const flash           = require('connect-flash');
    const http            = require('http');
    const Dropbox         = require('dropbox');
    const validator       = require('validator');
    let hours;

    hoursSchema.find({}, {'_id': false, 'order': false}, function(err, returnHours) {
        hours = returnHours;
    });

    router.get('/backendServices/getHours', function(req, res, next) {
      res.send(hours);
    });

    // /* GET logout page */
    // router.get('/logout', function(req, res, next) {
    //   req.logout();
    //   res.redirect('/');
    // });

    return router;
}
