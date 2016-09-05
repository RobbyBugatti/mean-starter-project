module.exports = function(app) {
    app.get('/admin/login', function(req, res, next) {
        return res.status(404).json({error: "Not Found"});
    });
}
