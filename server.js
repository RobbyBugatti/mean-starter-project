var express     = require('express');
var app         = express();
var router      = express.Router();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var path        = require('path');
var fs          = require('fs');
var Link        = require('./app/models/Link.js');
var mongoose    = require('mongoose');
var redis       = require('redis');

if(mongoose.connection.readyState === 0) {
    mongoose.connect(process.env.DATABASE_URL);
}

var client = redis.createClient('6379', 'redis');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
  next();
});

app.use(morgan('dev'));
// app.use(require('./app/middleware/jwt.js')());
app.use('/api', require('./app/middleware/api-auth.js')());
app.get('/', function(req, res) { res.sendFile(path.join(__dirname + '/public/index.html')); });
app.use(express.static(__dirname + '/public'));
function recursiveRoutes(folderName) {
    fs.readdirSync(folderName).forEach(function(file) {

        var fullName = path.join(folderName, file);
        var stat = fs.lstatSync(fullName);

        if (stat.isDirectory()) {
            recursiveRoutes(fullName);
        } else if (file.toLowerCase().indexOf('.js')) {
            require('./' + fullName)(router, client);
        }
    });
}

recursiveRoutes('./app/routes');


app.use('/', router);

app.get('/:slug', function(req, res) {
    console.log("Random slug attempt");
    Link.findOne({slug: req.params.slug}, function(err, link) {
        if(err)   return res.send("404 (Not Found)");
        if(!link) return res.status(404).json({error:"Not Found"});
        link.getRedirectUrl(req.query, function(err, url) {
            if(err) return res.send("500 (Server Error)");
            res.writeHead(302, {
                'Location': url
            });
            res.end();
            // Finally, we log the visit
            link.trackVisit(function(err) {
                if(err) {
                    console.log(err);
                } else {
                    client.set(req.params.slug, JSON.stringify(link), function(err, reply) {
                        if(err) {
                            console.log(err);
                        } else {
                            console.log("Visit recorded");
                        }
                    });
                }
            })
        })
    })
})

var server = app.listen(3000);

module.exports = server;
