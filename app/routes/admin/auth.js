module.exports = function(app) {
    app.get('/admin/login', function(req, res, next) {
        return res.code(404).json({error: "Not Found"})
    });
}
