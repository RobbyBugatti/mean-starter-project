module.exports = function(app) {
    app.get('/admin/admins', function(req, res, next) {
        return res.status(404).json({error: "Not Found"});
    });

    app.post('/admin/admins', function(req, res, next) {
        return res.status(404).json({error: "Not Found"});
    });

    app.put('/admin/admins/:admin_id', function(req, res, next) {
        return res.status(404).json({error: "Not Found"});
    });

    app.delete('/admin/admins/:admin_id', function(req, res, next) {
        return res.status(404).json({error: "Not Found"});
    });
}
