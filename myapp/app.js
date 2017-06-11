var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//*************** PROVA ************************************

var require_server = require('./server');
var app = require_server.app;
var server = require_server.server;

//***************************************************
var key = require('./key');
var jwt = require('express-jwt');
var jsonwebtoken = require("jsonwebtoken");
var SECRET=key.secret;

var authenticate = jwt({
  secret: SECRET,
});

var users = require('./routes/users');
var routes = require('./routes/index');
var api = require('./routes/api');




//var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/api', authenticate);
app.use('/api', api);

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

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


//*********************** PROVA ********************************
var server_port;
var server_ip_address;


server_port = process.env.PORT || 3000;
server_ip_address = process.env.IP || "0.0.0.0";

server.listen(server_port, server_ip_address);

//*******************************************************

module.exports = app;
