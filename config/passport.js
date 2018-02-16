/*
 * passport.js
 * Auth config
 * @author: Oren Shepes <oshepes@gmail.com>
 * @since: 2/13/18
 */

var LocalStrategy   = require('passport-local').Strategy;
var User            = require('../models/user');
var jwt             = require('jsonwebtoken');
var config          = require('./config.js').config;

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use('local-signup', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true 
    },
    function(req, email, password, done) {

        process.nextTick(function() {

            User.findOne({ 'local.email' :  email }, function(err, user) {
                // if there are any errors, return the error
                if (err)
                    return done(err);
                // check to see if theres already a user with that email
                if (user) {
                    return done(null, false, req.flash('signupMessage', 'Error: That email is already taken.'));
                } else {
                    try {
                        var token   = jwt.sign(req.user, config.SESSION_SECRET, { expiresIn: "365 Days" });
                    } catch(e) {
                        console.log(e);
                        var token   = '';
                    }
                    var newUser             = new User();
                    newUser.local.email     = email;
                    newUser.local.password  = newUser.generateHash(password);
                    newUser.token           = token;

                    // save the user
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }

            });    

        });

    }));
    
    passport.use('local-login', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true 
    }, 
    function(req, email, password, done) { 

        process.nextTick(function() {

            User.findOne({ 'local.email' :  email }, function(err, user) {
                
                if (err)
                    return done(err);

                if (!user)
                    return done(null, false, req.flash('loginMessage', 'Error: No user found.')); 

                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Error: Wrong username or password.'));

                return done(null, user);
            });
        });
    }));
};
