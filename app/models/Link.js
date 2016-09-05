var mongoose    = require('mongoose');
var shortid     = require('shortid');
var request     = require('request');
var cheerio     = require('cheerio');
var qs          = require('qs');

var linkSchema = new mongoose.Schema({
    slug        : { type: String,   required: true,     unique: true },
    long_url    : { type: String,   required: true },
    page_title  : { type: String,   required: false,    default: '' },
    url_tags    : {type: String,   required: false,    default: '' },
    created_at  : Date,
    updated_at  : Date,
    user_id     : { type: String,   default: 0 },
    analytics   : {
        total : { type: Number, default: 0 },
        daily : mongoose.Schema.Types.Mixed
    }
});

linkSchema.pre('validate', function(next) {
    var link = this;
    var current_date = new Date();
    if(!this.slug) this.slug = this.constructor.generateSlug();
    this.updated_at = current_date;
    if(!this.created_at) this.created_at = current_date;
    if(!this.analytics) {
        this.analytics = {
            total: 0,
            daily:  {}
        }
    }
    link.constructor.fetchTitleFromUrl(link.long_url, function(err, title) {
        link.page_title = link.long_url;
        if(title) link.page_title = title;
        return next();
    });
})

linkSchema.statics.fetchTitleFromUrl = function(url, cb) {
    request(url, function(error, response, body) {
        if(error) return cb(null, url);
        if(response.statusCode !== 200) return url;
        if(!error && response.statusCode == 200) {
            var $ = cheerio.load(body);
            var title = $("title").text();
            if(title) {
                return cb(null, title);
            } else {
                return cb(null, url);
            }
        }
    })
}

linkSchema.methods.trackVisit = function(cb) {
    var date = new Date().toISOString().split('T')[0];
    if(!this.analytics) this.analytics = {};
    if(!this.analytics.total) {
        this.analytics.total = 1;
    } else this.analytics.total++;
    if(!this.analytics.daily) this.analytics.daily = {};
    if(!this.analytics.daily[date]) {
        this.analytics.daily[date] = 1;
    } else this.analytics.daily[date]++;

    this.save(function(err) {
        if(err) return cb(err);
        cb();
    });
}

linkSchema.methods.getRedirectUrl = function(params, cb) {
    var url = this.long_url;
    var query_params = qs.parse(this.url_tags);
    for(key in params) {
        query_params[key] = params[key];
    }
    return cb(null, url + '?' + qs.stringify(query_params));
}

linkSchema.statics.generateSlug = function() {
    return shortid.generate();
}

var Link = mongoose.model('Link', linkSchema);
module.exports = Link;
