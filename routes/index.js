/** 
 * Router
 * @author Oren Shepes <oshepes@gmail.com>
 * @package: MAVERICK-api
 * @since 2/13/18
 */

var config  = require('../config/config.js').config;
var util    = require('util');
var jwt     = require('jsonwebtoken');
var bodyParser  = require('body-parser');
var lowercase   = require('lower-case');
var ucfirst     = require('upper-case-first');

module.exports = function (app, passport) {

    /* home */
    app.get('/', isLoggedIn, function (req, res) {
        res.render('pages/services', {
            "host": config.MAVERICK_HOST,
            "title": "MAVERICK-API",
            "header": "MAVERICK API",
            "heading": "Services"
        });
    });

    /* login */
    app.get('/login', function (req, res, next) {            
        var endpoint = util.format('%s/%s', config.MAVERICK_HOST, 'auth');
        res.header('Access-Control-Allow-Credentials', true);
        res.render('pages/login', {
            "host": config.MAVERICK_HOST,
            "socket_io": config.MAVERICK_SOCKET,
            "title": "MAVERICK Login",
            "header": "MAVERICK API",
            "heading": "Login",
            "endpoint": endpoint,
            "message": req.flash('loginMessage')
        });
    });

    /* login post */
    app.post('/login', passport.authenticate('local-login', {
            "successRedirect" : '/services', 
            "failureRedirect" : '/login', 
            "failureFlash" : true  
    }));
   
     /* logout */
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/login');
    });

    /* signup page */
    app.get('/signup', isLoggedIn, function(req, res) {
        res.render('pages/signup.ejs', { 
            "host": config.MAVERICK_HOST,
            "socket_io": config.MAVERICK_SOCKET,
            "title": "MAVERICK Signup",
            "header": "MAVERICK API",
            "heading": "Create a User",
            "message": req.flash('signupMessage')
        });
    });

    /* signup */
    app.post('/signup', passport.authenticate('local-signup', {
        "successRedirect" : '/',
        "failureRedirect" : '/signup', 
        "failureFlash" : true
    }));

    /* token page */
    app.get('/token', isLoggedIn, function(req, res) {
        res.render('pages/token.ejs', { 
            "host": config.MAVERICK_HOST,
            "socket_io": config.MAVERICK_SOCKET,
            "title": "API Token",
            "header": "MAVERICK API",
            "heading": "Create an API token",
        });
    });

    app.post('/auth', function(req, res, next) {
        passport.authenticate('local-login', function(err, user, info){
            if(err) { return next(err); }
            if(!user) { 
                return res.jsonp({
                    status: 403,
                    success: false,
                    message: 'Bad username/password - could not authenticate'
                });
            }
            req.logIn(user, function(err) {
                if(err) { return next(err); }
                var token   = jwt.sign(req.user, config.SESSION_SECRET, { expiresIn: "365 Days" });
                res.jsonp({
                    status: 200,
                    success: true,
                    message: 'Token created successfully',
                    token: token
                });
            });
        })(req, res, next);
    });

    /* -------------------------- START API Services ----------------------------- */

    /* validate API token 
    app.use(function(req, res, next) {
        var token = req.decoded || req.body.token || req.query.token || req.headers['x-access-token'] || req.token;
        if (token) {
            jwt.verify(token, config.SESSION_SECRET, function(err, decoded) {      
                if (err) {
                    return res.jsonp({ success: false, message: 'Failed to authenticate token.' });    
                } else {
                    req.decoded = decoded;    
                    next();
                }
            });

        } else {
            return res.status(403).jsonp({ 
                success: false, 
                message: 'No token provided.' 
            });
        }
    });

    */
    
    /* users - get */
    app.get('/users', function (req, res) {
        var Model = require('../models/user');
        var limit = req.params.limit || 1000;

        Model.find()
            .limit(parseInt(limit))
            .exec(function (err, result) {
                res.jsonp({data: result});
            });
    });
    
    /* users - add/create */
    app.post('/users', function (req, res) {
        var User = require('../models/user');
        var newUser             = new User();
        newUser.local.name      = req.body.name;
        newUser.local.email     = req.body.email;
        newUser.local.password  = newUser.generateHash(req.params.password);

        // save the user
        newUser.save(function(err) {
            if (err) throw err;
            return res.jsonp({data: newUser});
        });
    });

    /* users - update */
    app.put('/users', function (req, res) {
        var Model = require('../models/user');

        Model.update({
            name : req.body.name,
            email : req.body.email,
            password : req.body.password
        });
    });

    /* users - delete */
    app.delete('/users', function (req, res) {
        var Model = require('../models/user');

        Model.remove({
            email : req.body.email
        });
    });

    /* projects - get */
    app.get('/projects', function (req, res) {
        var Model = require('../models/project');
        var limit = req.params.limit || 1000;

        Model.find()
            .limit(parseInt(limit))
            .exec(function (err, result) {
                res.jsonp({data: result});
        });
    });
    
    /* projects - add/create */
    app.post('/projects', function (req, res) {
        var Project     = require('../models/project');
        var newProject  = new Project({title: req.body.title});

        // save the project
        newProject.save(function(err) {
            if (err) throw err;
            return res.jsonp({data: newProject});
        });
    });

    /* projects - update */
    app.put('/projects', function (req, res) {
        var Project = require('../models/project');
        Project.findOne({title: req.body.title}, function(err, doc){
            doc.title = req.body.new_title;
            doc.save(function(err) {
                if (err) return res.jsonp({error: err});
                return res.jsonp({data: doc});
            });
        });
    });

    /* projects - delete */
    app.delete('/projects', function (req, res) {
        var Project = require('../models/project');
        var newProject      = new Project();
        newProject.name     = req.params.name;

        // save the project
        newProject.remove(function(err) {
            if(err) return res.jsonp({error: err});
            return res.jsonp({data: newProject});
        });
    });

    /* tasks - get */
    app.get('/tasks', function (req, res) {
        var Model = require('../models/task');
        var limit = req.params.limit || 1000;

        Model.find()
            .limit(parseInt(limit))
            .exec(function (err, result) {
                res.jsonp({data: result});
        });
    });

    /* tasks - get by userid */
    app.post('/tasks/user', function (req, res) {
        var Model = require('../models/task');
        var limit = req.params.limit || 1000;

        Model.find({user_id: req.body.userid})
            .limit(parseInt(limit))
            .exec(function (err, result) {
                res.jsonp({data: result});
        });
    });

    /* tasks - get by due date */
    app.post('/tasks/date', function (req, res) {
        var Model = require('../models/task');
        var limit = req.params.limit || 1000;

        Model.find({due_date: req.body.date})
            .limit(parseInt(limit))
            .exec(function (err, result) {
                res.jsonp({data: result});
        });
    });

    /* tasks - get by priority */
    app.post('/tasks/priority', function (req, res) {
        var Model = require('../models/task');
        var limit = req.params.limit || 1000;

        Model.find({priority: req.body.priority})
            .limit(parseInt(limit))
            .exec(function (err, result) {
                res.jsonp({data: result});
        });
    });

    /* tasks - get by due date */
    app.post('/tasks/task', function (req, res) {
        var Model = require('../models/task');
        var limit = req.params.limit || 1000;

        Model.find({name: req.body.task_name})
            .limit(parseInt(limit))
            .exec(function (err, result) {
                res.jsonp({data: result});
        });
    });

    /* tasks - add */
    app.post('/tasks', function (req, res) {
        var Task    = require('../models/task');
        var newTask = new Task({
            name: req.body.name,
            project: req.body.project,
            summary: req.body.summary,
            due_date: req.body.due_date,
            description: req.body.description,
            priority: req.body.priority
        });

        // save the task
        newTask.save(function(err) {
            if (err) throw err;
            return res.jsonp({data: newTask});
        });
    });

    /* tasks - update */
    app.put('/tasks', function (req, res) {
        var Task = require('../models/task');
        Task.findOne({name: req.body.name}, function(err, doc){
            doc.project     = req.body.project;
            doc.summary     = req.body.summary;
            doc.due_date    = req.body.due_date;
            doc.description = req.body.description;
            doc.priority    = req.body.priority;

            // save the task
            doc.save(function(err) {
                if (err) throw err;
                return res.jsonp({data: doc});
            });
        });
    });

    /* tasks - delete */
    app.delete('/tasks', function (req, res) {
        var Task = require('../models/task');
        var newTask      = new Task();
        newTask.name     = req.params.name;

        // save the task
        newTask.findByIdAndRemove({name: req.body.name}, function(err) {
            if (err) throw err;
            return res.jsonp({data: newTask});
        });
    });

    /* 404 handler */
    app.get('*', function(req, res){
        res.redirect('/');
    });

    function isLoggedIn(req, res, next) {  
        if (req.isAuthenticated())
            return next();
        res.redirect('/login');
    }

};
