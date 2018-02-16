/*
 * Node Server
 * Implements the MAVERICK API
 * @package: MAVERICK-api
 * @author: Oren Shepes <oshepes@gmail.com>
 * @since: 2/15/18
 */

/* modules */
var config      = require('./config/config.js').config; 
var configDB    = require('./config/database.js').db;

var express     = require('express');
var cors        = require('cors');
var app         = express();
var mongoose    = require('mongoose');
var passport    = require('passport');
var flash       = require('connect-flash');
var path        = require('path');
var jwt         = require('jsonwebtoken');
var morgan      = require('morgan');
var cookieParser= require('cookie-parser');
var bodyParser  = require('body-parser');
var util        = require('util');
var shortid     = require('shortid');
var cookieParser = require('cookie-parser');
var session      = require('express-session');
var MongoStore   = require('connect-mongostore')(session);
var fs           = require('fs');
var port         = 8080;
var server;
var http        = require('http');


// app config 
app.use(cors());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

mongoose.createConnection(config.MONGODB_HOST);
console.log("Connecting to %s", config.MONGODB_HOST);

mongoose.connect(config.MONGODB_HOST, function(e) {
    if(e) throw e;
    app.use(session({
        secret: config.SESSION_SECRET,
        key: 'user', 
        cookie: { maxAge: 86400000, secure: false },
        resave: true, 
        saveUninitialized: true,
        store: new MongoStore({
            "db": configDB.MONGODB_DB,
            "collection": configDB.MONGODB_SESSION,
            "auto_reconnect": true,
            "options" : {
                "autoReconnect" : true,
            }
        })
    }));
});

/* passport init */
app.use(passport.initialize());
app.use(passport.session()); 
app.use(flash());


// passport config
require('./config/passport')(passport);

/* set auth user
app.use(function(req, res, next) {
    res.locals.user = req.user;
    next();
});
*/

// router 
var routes = require('./routes/')(app, passport);

module.exports = app;

/* start server */
http.createServer(app).listen(port, function () {
  console.log('Listening on %s:%s', config.MAVERICK_HOST, port);
});
