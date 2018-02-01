var express      = require('express'),
    logger       = require('morgan'),
    bodyParser   = require('body-parser'),
    load         = require('express-load');
    session      = require('express-session');

var app = express();

// generate logs of requests
app.use(logger('dev'));

// converts the request to JSON
app.use(bodyParser.json({ type: 'text' }));
app.use(bodyParser.json());

// create user session
app.use(session({secret:'ss3ncr1ptk3yq1n3d4ni3l9iek', resave:false, saveUninitialized:true}));

// request permission for other domains
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});

// verify if user is logged in
app.use(['/api/servers', '/api/directories'], function(req, res, next) {
  if (req.session.user == undefined){
    res.status(500).json({message: "User isn't logged in!"});
  }
  next();
});
  
// load routes
load('controllers').then('routes').into(app);

// catch authentication failed and forward to error handler
app.use(function(err, req, res, next) {
  if (err.message == "All configured authentication methods failed"){
    err.status = 401;
  }
  next(err);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // send the error
  res.status(err.status || 500);
  res.json({message: err.message});
});

module.exports = app;
