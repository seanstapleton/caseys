module.exports = function(db, passport) {
    const express         = require('express');
    const router          = express.Router();
    const bodyParser      = require('body-parser');
    const nodemailer      = require('nodemailer');
    const hoursSchema     = require('../models/hours.js');
    const menuSchema      = require('../models/menu.js');
    const itemSchema      = require('../models/items.js');
    const eventsSchema    = require('../models/events.js');
    const photosSchema    = require('../models/photos.js');
    const specialsSchema  = require('../models/specials.js');
    const messageSchema   = require('../models/message.js');
    const applicantSchema = require('../models/applicant.js');
    const editSchema      = require('../models/edit.js');
    const partySchema     = require('../models/party.js');
    const flash           = require('connect-flash');
    const https           = require('https');
    const Dropbox         = require('dropbox');
    const validator       = require('validator');
    const path            = require('path');
    const mg              = require('nodemailer-mailgun-transport');
    const dbx             = new Dropbox({ accessToken: process.env.db_access });
    const axios = require('axios');
    const _ = require('lodash');

    const fbAccessToken = process.env.page_access;

    // dbx.filesListFolder({path: '/photo_gallery'})
    //   .then(function(data) {
    //     const promises = [];
    //     for (const i = 0; i < data.entries.length; i++) {
    //       const pr = Promise.all([dbx.sharingCreateSharedLink({path: data.entries[i].path_lower}),dbx.sharingCreateSharedLink({path: "/thumbnails/" + data.entries[i].name})]);
    //       promises.push(pr);
    //     }
    //     console.log("yo");
    //     Promise.all(promises)
    //       .then(function(values) {
    //         console.log("ay");
    //         for (const j = 0; j < values.length; j++) {
    //             const idx = [values[j][0].url.indexOf(".com"),values[j][1].url.indexOf(".com")];
    //             const photo = new photosSchema({
    //               src: "https://dl.dropboxusercontent" + values[j][0].url.substring(idx[0]),
    //               thumbnail: "https://dl.dropboxusercontent" + values[j][1].url.substring(idx[1])
    //             });
    //             photo.save();
    //         }
    //       });
    //   });

    router.post('/insta', function(req, response, next) {

      const https = require('https');

      https.get('https://api.instagram.com/v1/users/self/media/recent/?access_token=' + process.env.igaccess, (res) => {

        res.setEncoding('utf8');
          let rawData = '';
          res.on('data', (chunk) => rawData += chunk);
          res.on('end', () => {
            try {
              let parsedData = JSON.parse(rawData);
              response.send(parsedData);
            } catch (e) {
              console.log(e.message);
            }
          });
      }).on('error', (e) => {
        console.error(e);
      });
    });

    const logEdit = function(author,desc,edited_items) {
      author = author || "unknown";
      edited_items = edited_items || [];
      const edit = new editSchema({
        author: author.name || "none",
        author_id: author._id,
        description: desc,
        date_time: new Date(),
        edited_items: edited_items
      });
      edit.save();
      console.log("------- edit logged --------");
    }

    router.get('/getFBID', function(req, res) {
      return res.send(process.env.fbid);
    });

    const LocalStrategy = require('passport-local').Strategy;
    const register = require('../passport/config.js')(passport);
    router.post('/register', function(req, res, next) {
        passport.authenticate('register', function(err, newUser, info) {
          if (err) return next(err);
          if (!newUser) return res.send({success: false});
        })(req,res,next);
    });

    router.get('/getMenus', function(req, res) {
      menuSchema.find({}, {}, {sort: {"start": -1}}, function(err, events) {
            if (events) {
              res.send(events);
            } else {
              res.end();
            }
        });
    });

    router.post('/login', function(req, res, next) {
      passport.authenticate('login', function(err, user, info) {
        if (err) return next(err);
        if (!user) return res.send({success: false});
        req.login(user, loginErr => {
            if(loginErr) {
                return next(loginErr);
            }
            return res.send({success: true});
        });
      })(req, res, next);
    });

    const isLoggedIn = function(req, res, next) {
      if (req.isAuthenticated()) {
        console.log("logged in");
        return res.send({loggedIn: true});
      } else {
        return res.send({loggedIn: false});
      }
    }

    router.get('/getEvents', async  (req, res) => {
      const prefix = 'https://graph.facebook.com';
      const pageName = 'caseysnewbuffalomichigan';
      const endpoint = `${prefix}/${pageName}/events?fields=name,start_time&access_token=${fbAccessToken}`;
      try {
        const response = await axios.get(endpoint);
        const events = _.orderBy(response.data.data, ['start_time'], ['desc']);
        const eventsWithUrl = _.map(events, e => {
          e.url = `https://facebook.com/events/${e.id}`;
          return e;
        });
        return res.send({ success: true, events: eventsWithUrl });
      } catch (e) {
        console.log(e);
        return res.send({ success: false, err: e });
      }
    });

    router.get('/upcomingEvents', async  (req, res) => {
      const prefix = 'https://graph.facebook.com';
      const pageName = 'caseysnewbuffalomichigan';
      const endpoint = `${prefix}/${pageName}/events?fields=name,start_time,cover&access_token=${fbAccessToken}`;
      try {
        const response = await axios.get(endpoint);
        const data = _.map(response.data.data, (o) => {
          o.image = _.get(o, 'cover.source');
          if (o.cover) {
            delete o.cover;
          }
          return o;
        });
        const events = _.orderBy(data, ['start_time'], ['desc']);
        const futureEvents = _.reject(events, (e) => {
          const today = new Date();
          today.setHours(0,0,0,0);
          return new Date(e.start_time).getTime() <= today.getTime();
        });
        const fiveNextEvents = futureEvents.slice(Math.max(futureEvents.length - 5, 0));
        return res.send({ success: true, events: fiveNextEvents });
      } catch (e) {
        console.log(e.message);
        return res.send({ success: false, err: e.message });
      }
    });

    router.get('/getPhotos', function(req, res) {
      // dbx.filesListFolder({path: '/photo_gallery'})
      //   .then(function(data) {
      //     const promises = [];
      //     for (const i = 0; i < data.entries.length; i++) {
      //       const pr = Promise.all([dbx.sharingCreateSharedLink({path: data.entries[i].path_lower}),dbx.sharingCreateSharedLink({path: "/thumbnails/" + data.entries[i].name})]);
      //       promises.push(pr);
      //     }
      //     console.log("yo");
      //     Promise.all(promises)
      //       .then(function(values) {
      //         console.log("ay");
      //         for (const j = 0; j < values.length; j++) {
      //             const idx = [values[j][0].url.indexOf(".com"),values[j][1].url.indexOf(".com")];
      //             const photo = new photosSchema({
      //               src: "https://dl.dropboxusercontent" + values[j][0].url.substring(idx[0]),
      //               thumbnail: "https://dl.dropboxusercontent" + values[j][1].url.substring(idx[1])
      //             });
      //             photo.save();
      //         }
      //       });
      //   });

      photosSchema.find({}, {}, function(err, photos) {
            if (photos) {
              res.send(photos);
            } else {
              res.end();
            }
        });
    });

    router.post('/addEvent', function(req, res, next) {
      const event = new eventsSchema({
          title: req.body.title,
          start: req.body.start,
          end: req.body.end,
          description: req.body.description,
          allDay: false,
          url: req.body.url,
          img: req.body.img,
          featured: req.body.featured
      });
      event.save(function(err, ev) {
        if (err) res.send({success: false, err: err});
        else res.send({success: true});
      });
      const message = (req.body.title == "Untitled (New)") ? "added a new event" : "duplicated an event";
      logEdit(req.user,message,[req.body]);
    });

    router.post('/editEvent', function(req, res, next) {
      eventsSchema.findOneAndUpdate({_id: req.body._id}, req.body, {upsert: true}, function(err, doc) {
          if (err) return res.send({success: false, err: err});
          else return res.send({success: true});
          logEdit(req.user,"edited an event", [req.body]);
      });
    });

    router.post('/addParty', function(req, res, next) {
      const party = new partySchema({
          title: req.body.title
      });
      party.save(function(err, ev) {
        if (err) res.send({success: false, err: err});
        else res.send({success: true});
      });
      logEdit(req.user,"added a new party",[req.body]);
    });

    router.post('/editParty', function(req, res, next) {
      partySchema.findOneAndUpdate({_id: req.body._id}, req.body, {upsert: true}, function(err, doc) {
          if (err) res.send({success: false, err: err});
          else res.send({success: true});
          logEdit(req.user,"edited a party", [req.body]);
      });
    });

    router.post('/editItem', function(req, res, next) {
      itemSchema.findOneAndUpdate({_id: req.body._id}, req.body, {upsert: true, new: true}, function(err, doc) {
          if (err) res.send({success: false, err: err});
          else res.send({success: true, item: doc});
          logEdit(req.user,"edited a menu item", [req.body]);
      });
    });

    router.post('/addItem', function(req, res, next) {
      const item = new itemSchema({
          title: req.body.title,
          desc: req.body.desc,
          price: req.body.price,
          tags: req.body.tags,
          availabilities: req.body.availabilities
      });
      item.save(function(err, item) {
        if (err) res.send({success: false, err: err});
        else res.send({success: true, item: item});
      });
      logEdit(req.user,"added a new menu item", [item]);
    });

    router.post('/deleteEvent', function(req, res, next) {
      console.log(req.body);
      eventsSchema.find({_id: req.body._id}).remove(function(err, data) {
        if (err) {console.log(err); return res.send({success: false, err: err});}
        else return res.send({success: true});
        logEdit(req.user,"deleted an event", [req.body]);
      });
    });

    router.post('/deleteParty', function(req, res, next) {
      partySchema.find({_id: req.body._id}).remove(function(err, data) {
        if (err) {
          console.log(err);
          res.send({success: false, err: err});
        }
        else res.send({success: true});
        logEdit(req.user, "deleted a party", [req.body]);
      });
    });

    router.post('/deleteMenuItem', function(req, res, next) {
      itemSchema.find({_id: req.body._id}).remove(function(err, data) {
        if (err) {
          console.log(err);
          res.send({success: false, err: err});
        }
        else res.send({success: true, item: {_id: req.body._id}});
        logEdit(req.user,"deleted a menu item", [req.body]);
      });
    });

    router.get('/deleteWithTag/:tag', function(req, res, next) {
      itemSchema.find({tags: [req.params.tag]}).remove(function(err, data) {
        if (err) {
          console.log(err);
          res.send({success: false, err: err});
        }
        else res.send({success: true});
      });
    });

    router.get('/isLoggedIn', function(req, res, next) {
      return isLoggedIn(req, res, next);
    });

    router.get('/logout', function(req, res, next) {
      req.logout();
      res.send("logged out");
    });

    router.post('/sendMessage', function(req, res, next) {
      const auth = {
        auth: {
          api_key: process.env.api_key,
          domain: process.env.domain
        }
      }
      const data = req.body;
      if (!data.phnum) data.phnum = "Not given";
      let result;
      const smtpTransporter = nodemailer.createTransport(mg(auth));
      const message = {
        from: 'caseysnb136@gmail.com',
        to: 'caseysnb136@gmail.com',
        subject: 'Caseys Contact Form: ' + data.name,
        text: "Name: " + data.name + "\nEmail: " + data.email + "\nPhone Number: " + data.phnum + "\nMessage: " + data.message
      };

      smtpTransporter.sendMail(message, function(err, info) {
         if (err) {
            console.log(err);
            return res.send({success: false, err: err});
         } else {
            console.log(info);
            return res.send({success: true});
         }
      });
    });

    router.post('/applyToWork', function(req, res, next) {
      const auth = {
        auth: {
          api_key: process.env.api_key,
          domain: process.env.domain
        }
      }
      const data = req.body;
      if (!data.message) data.message = "Not given";
      const smtpTransporter = nodemailer.createTransport(mg(auth));
      const message = {
        from: 'caseysnb136@gmail.com',
        to: 'caseysnb136@gmail.com',
        subject: 'Job Application: ' + data.first_name + " " + data.last_name,
        text: "Name: " + data.first_name + " " + data.last_name + "\nEmail: " + data.email + "\nPhone Number: " + data.phnum + "\nDesired Position: " + data.position + "\nMessage: " + data.message
      };

      smtpTransporter.sendMail(message, function(err, info) {
         if (err) {
            console.log(err);
            return res.send({success: false, err: err});
         } else {
            console.log(info);
            return res.send({success: true});
         }
      });

      const applicant = new applicantSchema(data);
      applicant.save();
    });

    router.post('/reserveTable', function(req, res, next) {
      const auth = {
        auth: {
          api_key: process.env.api_key,
          domain: process.env.domain
        }
      }
      const data = req.body;
      let result;
      const smtpTransporter = nodemailer.createTransport(mg(auth));
      const message = {
        from: 'caseysnb136@gmail.com',
        to: 'caseysnb136@gmail.com',
        subject: 'Caseys Reservation: ' + data.name,
        text: "Date: " + data.date + "\nTime: " + data.time + "\nName: " + data.name + "\nEmail: " + data.email + "\nPhone Number: " + data.phnum + "\nParty Size: " + data.size
      };

      smtpTransporter.sendMail(message, function(err, info) {
         if (err) {
            console.log(err);
            return res.send({success: false, err: err});
         } else {
            console.log(info);
            return res.send({success: true});
         }
      });
    });

    router.get("/getUser", function(req, res) {
      if (req.user) res.send({"success": true, user: {name: req.user.name, admin: req.user.admin}});
      else res.send({"success": false, "err": "500"});
    });

    router.get('/getLogs', function(req, res) {
      editSchema.find({},{}, function(err, logs) {
        if (err) console.log(err);
        else res.send(logs);
      });
    });

    router.get('/getItems', function(req, res) {
      itemSchema.find({},{}, function(err, items) {
        if (err) console.log(err);
        else res.send(items);
      });
    });

    router.get('/getParties', function(req, res) {
      partySchema.find({},{}, function(err, menus) {
        if (err) console.log(err);
        else res.send(menus);
      });
    });

    return router;
}
