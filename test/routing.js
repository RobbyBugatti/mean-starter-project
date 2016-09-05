var mongoose = require('mongoose');
var request = require('supertest');
describe('Routing', function() {
    var server;
    beforeEach(function(done) {
        delete require.cache[require.resolve('../server.js')];
        server = require('../server.js');
        done()
    })
    afterEach(function(done) {
        server.close(function() {
            mongoose.disconnect(done());
        })
    })
    before(function(done) {
        done()
    })
    after(function(done) {
        done()
    })
    it('responds to /login', function(done) {
        request(server)
            .post('/login')
            .expect(400, done);
    });

    // Make sure that unavailable routes return as such
    it('responds to /oauth/authorize', function(done) {     request(server).get('/oauth/authorize').expect(404, done) })
    it('responds to /oauth/access_token', function(done) {  request(server).post('/oauth/access_token').expect(404, done) })
    it('responds to /forgot_password', function(done) {     request(server).post('/forgot_password').expect(404, done) })
    it('responds to /reset_password', function(done) {      request(server).post('/reset_password').expect(404, done) })
    it('responds to /some-random-slug', function(done) {    request(server).get('/some-random-slug').expect(404, done) })
})
