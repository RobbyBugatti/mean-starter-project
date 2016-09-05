var expect      = require("chai").expect;
var assert      = require('chai').assert;
var should      = require('chai').should;
var request     = require('request');
var Link        = require("../app/models/Link.js");
var mongoose    = require('mongoose');

describe("Links", function() {
    var currentLink = null;
    before(function(done) {
        if(mongoose.connection.readyState !== 1) mongoose.connect(process.env.DATABASE_URL);
        done();
    });
    after(function(done) {
        mongoose.disconnect();
        done();
    });
    beforeEach(function(done) {
        done();
    });
    afterEach(function(done) {
        currentLink = null;
        done();
    })
    it('creates in global namespace', function(done) {
        this.timeout(5000);
        var link = Link({
            'long_url' : 'http://google.com'
        });
        link.save(function(err) {
            if(err) throw err;
            expect(link.long_url).to.equal('http://google.com');
            expect(link.user_id).to.equal('0');
            expect(link.slug).to.exist;
            expect(link.page_title).to.equal('Google');
            done();
        })
    });
    it('creates in users namespace', function(done) {
        this.timeout(5000);
        var user_id = '57091212n12n3n';
        var link = Link({
            'long_url' : 'http://google.com',
            'user_id'  : user_id
        });
        link.save(function(err) {
            if(err) throw err;
            expect(link.user_id).to.equal(user_id);
            done();
        })
    });
    it('stores analytics', function(done) {
        this.timeout(5000);
        var date = new Date().toISOString().split('T')[0];
        Link.findOne({}, {}, {sort: { 'created_at' : -1} }, function(err, doc) {
            if(err) throw err;
            var current_total = doc.analytics.total;
            var current_daily = 0;
            if(doc.analytics.daily && doc.analytics.daily[date]) current_daily = doc.analyticsdaily[date];
            doc.trackVisit(function(err) {
                if(err) throw err;
                expect(doc.analytics.total).to.equal(current_total + 1);
                expect(doc.analytics.daily[date]).to.equal(current_daily + 1);
                done();
            })
        })
    });
    it('updates long_url');
    it('has immutable slug');
    it('fetches page titles from urls');
    it('generates slugs');
    it('correctly builds a redirect URL', function(done) {
        var tests = [
            { params : {}, expectation: 'http://google.com?test=true'},
            { params : {'another' : 'test_hhere'}, expectation: 'http://google.com?test=true&another=test_hhere'},
            { params : {'test'    : 'false'}, expectation: 'http://google.com?test=false'}
        ];
        var link = Link({
            long_url: 'http://google.com',
            url_tags: 'test=true'
        });
        link.save(function(err) {
            if(err) throw err;
            var executed = 0;
            for(var i = 0; i < tests.length; i++) {
                link.getRedirectUrl(tests[i].params, function(err, url) {
                    if(err) throw err;
                    expect(url).to.equal(tests[i].expectation);
                    if(++executed == tests.length) {
                        done();
                    }
                })
            }
            // Now we iterate through a bunch of possible scenarios, and check the results
        })
    });
})
