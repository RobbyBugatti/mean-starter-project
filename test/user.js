var expect      = require("chai").expect;
var assert      = require('chai').assert;
var should      = require('chai').should
var User        = require("../app/models/User.js");
var mongoose    = require('mongoose');
var test_email  = 'test2@test.com';

describe("Users", function() {
    var currentUser = null;

    before(function(done) {
        if(mongoose.connection.readyState !== 1) mongoose.connect(process.env.DATABASE_URL);
        var user = User({
            email       : 'test@test.com',
            password    : 'password'
        });

        user.save(function(err) {
            if(err) throw err;
            currentUser = user;
            done();
        })
    });
    after(function(done) {
        User.remove({email: { $in : ['test@test.com', 'test2@test.com']}}, function(err) {
            if(err) throw err;
            mongoose.disconnect();
            done();
        })
    });
    beforeEach(function(done) { done(); });
    afterEach(function(done)  { done(); });
    it('validates a users email');
    it('validates a users password');
    it('changes password');
    it('locks itself after unsuccessful logins');

    it('registers a new user', function(done) {
        var user2 = User({
            email       : test_email,
            password    : 'password'
        })

        user2.save(function(err) {
            if(err) throw err;
            expect(user2.email).to.equal(test_email);
            done();
        })
    });

    it('logins a returning user', function(done) {
        User.getAuthenticated(test_email, 'password', function(err, user) {
            if(err) throw err;
            expect(user.email).to.equal(test_email);
            done();
        })
    })
})
