var Link = require('../../models/Link.js');

const CACHE_TIME = 10 * 60 * 1000;
module.exports = function(app, redis) {
    // Get all links
    app.get('/api/links', function(req, res, next) {
        var limit = req.query.per_page ?
                        req.query.per_page :
                        25;
        var skip = req.query.page ?
                        ((req.query.page * limit) - limit) :
                        0;
        Link
            .find({user_id: req.user._id})
            .sort({created_at: -1})
            .select('_id created_at updated_at slug long_url user_id url_tags page_title')
            .limit(limit)
            .skip(skip)
            .exec(function(err, docs) {
                if(err) return res.status(500).json({error: "An unexpected error occured"});
                return res.json({
                    "links" : docs
                });
            });
    });
    // Fetch an individual link based on the slug
    app.get('/api/links/:slug', function(req, res, next) {
        redis.get(req.params.slug, function(err, reply) {
            if(err) {
                console.log(err);
                return res.status(500).json({error: "Redis server error"});
            } else if(reply) {
                // We can pull from redis, but we also have to double check
                // that this user has access to ir
                link = JSON.parse(reply);
                if(link.user_id == req.user._id) {
                    return res.json({link: link});
                } else {
                    return res.status(404).json({error: "Not Found"});
                }
            } else {
                Link
                .findOne({user_id: req.user._id, slug: req.params.slug})
                .exec(function(err, docs) {
                    if(err) return res.status(500).json({error: "An unexpected error occured"});
                    if(docs) {
                        res.json({
                            "link" : docs
                        }).end();
                        redis.set(req.params.slug, JSON.stringify(docs), function() {
                        })
                    }
                    return res.status(404).json({error: "Not Found"});
                })
            }
        })
    });
    // Create a new link, inside the user namespace
    app.post('/api/links', function(req, res, next) {
        var link = Link({
            long_url    : req.body.long_url,
            url_tags    : req.body.query_string,
            user_id     : req.user._id
        });
        link.save(function(err) {
            if(err) {
                return res.status(500).json({
                    error: err.message
                });
            };
            redis.set(link.slug, JSON.stringify(link), function(err) {
                if(err) {
                    return res.status(500).json({
                        error: "Error with Redis store"
                    });
                } else {
                    return res.status(201).json({
                        link: link
                    });
                }
            })
        })
    });
    // Update a link,
    app.post('/api/links/:slug', function(req, res, next) {
        if(!req.body.long_url && !req.body.url_tags) {
            res.status(304);
            res.end();
        }
        var params = {};
        if(req.body.long_url) params.long_url = req.body.long_url;
        if(req.body.url_tags) params.url_tags = req.body.url_tags;
        Link.findOneAndUpdate(
            {user_id: req.user._id, slug: req.params.slug},
            {
                $set : params
            },
            {new: true},
            function(err, doc) {
                if(err) {
                    console.log(err);
                    return res.status(500).json({error:err.message});
                }
                if(doc) {
                    redis.set(req.params.slug, JSON.stringify(doc), function(err, reply) {
                        if(err) {
                            console.log(err);
                        }
                    })
                    res.status(200).end();
                }
                res.status(304).end();
            }
        )
    });
    // Lastly, delete a link
    app.delete('/api/links/:slug', function(req, res, next) {
        Link.findOneAndRemove(
            {user_id: req.user._id, slug: req.params.slug},
            function(err, doc) {
                if(err) return res.status(500).json({error: "An unexpected error occured"});
                if(doc) {
                    res.status(200).end();
                    redis.del(req.params.slug, function(err, reply) {
                        if(err) {
                            console.log(err);
                        }
                    })
                }
            }
        )
    });
}
