// var express     = require('express'),
//     app         = express(),
//     http        = require('http').Server(app),
//     _           = require('underscore'),
//     router      = express.Router(),
//     io          = require('socket.io')(http);
//
// // Set statc serving directories
// app.use( express.static( __dirname + '/public' ) );
// app.use( '/vendor', express.static(  __dirname + '/bower_components' ) );
//
// app.get('*', function(req, res, next) {
//     console.log("Serving request at index.html");
//     res.send("Hello World from "+process.env.HOSTNAME);
// })
// io.on('connection', function(socket) {
//     console.log("New socket connected");
// })
//
// http.listen(3000, function() {
//     console.log("Server listening on port 3000");
// })

var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    path = require('path');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
  next();
});

app.use(morgan('dev'));

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.listen(3000);
console.log('meet-irl is running on 8080');
