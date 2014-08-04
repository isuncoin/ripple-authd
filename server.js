
/**
 * Module dependencies.
 */

var express = require('express')
  , api = require('./routes/api')
  , fs = require('fs')
  , path = require('path')
  , http = require('http')
  , https = require('https')
  , path = require('path')
  , config = require('./config')
  , Ddos= require('ddos');

var ddos = new Ddos;

var app = express();

app.configure(function(){
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
});

var server;
app.configure('development', function(){
  app.set('port', config.port || 3000);
  server = http.createServer(app);
  app.use(express.errorHandler());
});

app.configure('production', function(){
  app.set('port', config.port || 443);
  server = https.createServer({
    ca: fs.readFileSync(path.resolve(__dirname, 'ca.crt')),
    key: fs.readFileSync(path.resolve(__dirname, 'ssl.key')),
    cert: fs.readFileSync(path.resolve(__dirname, 'ssl.crt'))
  }, app);
});

app.options("/api/sign", api.cors);
app.post('/api/sign', api.sign);

server.listen(app.get('port'), function(){
  console.log("Ripple authd listening on port " + app.get('port'));
});
/*
var express = require('express')
  , api = require('./routes/api')
  , fs = require('fs')
  , path = require('path')
  , http = require('http')
  , https = require('https')
  , path = require('path')
  , config = require('./config');

var app = express();

var env = process.env.NODE_ENV || 'development';

app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());

app.options("/api/sign", api.cors);
app.post('/api/sign', api.sign);

var server;
if (env === 'development') {
  app.set('port', config.port || 3000);
  server = http.createServer(app);
  app.use(express.errorHandler());
} else if (env === 'production') {
  app.set('port', config.port || 443);
  server = https.createServer({
    ca: fs.readFileSync(path.resolve(__dirname, 'ca.crt')),
    key: fs.readFileSync(path.resolve(__dirname, 'ssl.key')),
    cert: fs.readFileSync(path.resolve(__dirname, 'ssl.crt'))
  }, app);
}


server.listen(app.get('port'), function(){
  console.log("Ripple authd listening on port " + app.get('port'));
});
*/
