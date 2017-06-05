module.exports = function(passport) {
  var LocalStrategy = require('passport-local');
  var User = require('../models/users');
  var bCrypt = require('bcrypt-nodejs');

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  passport.use('register', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  }, function(req, email, password, done) {

    process.nextTick(function() {
      User.findOne({'email': email}, function(err, user) {
        if (err) {
          console.log(err);
          return done(err);
        }
        if (user) {
          console.log("Email already in use");
          return done(null, false, req.flash({message: 'Email already in use'}));
        }
        else {
          var newUser = new User();
          newUser.email = email;
          // newUser.password = newUser.generateHash(password);
          newUser.password = password;

          newUser.save(function(err) {
            if (err) {
              console.log('Error in registration: ' + err);
              done(null, false, req.flash({message: 'Save Error.'}));
            }
            else {
              console.log("User registration successful.");
              return done(null, newUser);
            }
          });
          return done(null, newUser);
        }
      });
    });

  }));

  passport.use('login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  }, function(req, email, password, done) {
      console.log("ay");
    User.find({'email': email}, function(err, user) {
      console.log("yo");
      if (err) {
        console.log("error passport");
        return done(err);
      }
      if(!user) {
        console.log('No user found');
        return done(null, false, req.flash('loginMessage', 'No user found'));
      }
      if (!user.validPassword(password)) {
        console.log("incorrect password");
        return done(null, false, req.flash,('loginMessage', 'Incorrect Password'));
      }
      return done(null, user);
    })
  }));
};
