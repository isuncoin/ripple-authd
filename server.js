
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
  , morgan = require('morgan')
  , log = require('./lib/log').winston;

var app = express();

// Overload the remote-user token which is a default part of combined
// Pull the remote-user from the info string instead so we can track user login
morgan.token('remote-user', function getUser(req) {
  return req.body.info || '';
})

app.configure(function(){
  app.use(morgan('combined', {stream: log.winstonStream}));
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
