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
app.post('/api/test', api.test);

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
    request.post({url:'http://localhost:'+app.get('port')+'/api/test',json:{info:'PAKDF_1_0_0:16:auth1.ripple.com:9:testpakdf:5:login:',signreq:'1db48e7b8fd93e13e02ba8ef922b2a578f3980ef82218834c37bba51fd4f1050297973835a07c54a22b9d8313b6a4371febdb13483e0eb144716cff149a8e8ab99f66f10cc6f33116051ab09ecc5a7e7c6d67134e00a02ff63f908eded64291aceea4006ce28aef94406bf08269e621c6723eba6d3caf2872cb67301582e3f36bed843daf3e5a4f2c2a207bfddf89ce7bf0713f12061f7832b269200be293446ddb4dc3076c2f8ee3d87e9b1419b1fa402da472def887d49d1b0f8e409abb0cf13f7c1e6638d4878f77b9d954617fe1c79249b779b71e7e0e021ff169172bd55fc532502d0b446114f5be2f3c425cc823adaee8dd2867f83f2d2f0dc3f43aba2'}},
    function(err,resp,body) {
        if (resp.statusCode !== 400) {
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

