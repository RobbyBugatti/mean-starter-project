module.exports = function(app) {
    // Request API authorization form
    app.get('/oauth/authorize', function(req, res, next) {
        return res.code(404).json({error: "Not Found"});
    });
    // Take a ggenerated access code, and return an access token
    app.post('/oauth/access_token', function(req, res, next) {
        return res.code(404).json({error: "Not Found"});
    });
}
