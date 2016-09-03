var Link = require('../models/Link.js');
// Routes for document root pages
module.exports = function(app) {
    // GET '/'
    app.get('/', function(req, res) {
        res.sendFile(__dirname+'/public/index.html');
    });

    // POST '/links'
    app.post('/links', function(req, res) {
        var link = Link({
            long_url    : req.body.long_url,
            url_tags    : req.body.query_string
        });
        link.save(function(err) {
            if(err) {
                return res.status(500).json({
                    error: err.message
                });
            };
            return res.status(201).json({
                link: link
            });
        })
    })
}
