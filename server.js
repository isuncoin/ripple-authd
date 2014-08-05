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
var reporter = require('./lib/reporter')
var ddos = new Ddos;
var app = express();
var env = process.env.NODE_ENV || 'development';
var morgan  = require('morgan')
var bodyParser = require('body-parser')
var methodOverride = require('method-override')
var errorhandler = require('errorhandler')
var cors = require('cors')

app.use(reporter.inspect)
app.use(ddos.express);
app.use(morgan('combined'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

app.post('/api/sign', api.sign);

var server;
if (env === 'development') {
    app.set('port', config.port || 3000);
    server = http.createServer(app);
    app.use(errorhandler());
} else if (env === 'production') {
    app.set('port', config.port || 443);
    server = https.createServer({
    ca: fs.readFileSync(path.resolve(__dirname, 'ca.crt')),
    key: fs.readFileSync(path.resolve(__dirname, 'ssl.key')),
    cert: fs.readFileSync(path.resolve(__dirname, 'ssl.crt'))
    }, app);
} else {
    app.set('port', 3000);
    server = http.createServer(app);
    app.use(errorhandler());
}

server.listen(app.get('port'), function(){
    console.log("Ripple authd listening on port " + app.get('port'));
});


var request = require('request')
setInterval(function() {
    console.log("posting", app.get('port'))
    request.post({url:'http://localhost:'+app.get('port')+'/api/sign',json:{info:'PAKDF_1_0_0:17:pakdf.example.com:3:foo:3:bar:',signreq:'bar'}},
    function(err,resp,body) {
        // change to 200 on correct signreq
        if (resp.statusCode != 400) {
            reporter.log('authd: test failure')
            reporter.log(resp.statusCode,resp.headers,body)
            process.exit()
        }
    })
}, 2000)
process.on('SIGTERM',function() {
    reporter.log("caught sigterm");
    process.exit();
});
process.on('SIGINT',function() {
    reporter.log("caught sigint");
    process.exit();
});
process.on('exit',function() {
    reporter.log("Done");
});

