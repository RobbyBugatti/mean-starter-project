module.exports = function(app) {
    app.get('/admin/links', function(req, res, next) {
        return res.status(404).json({error: "Not Found"});
    });

    app.get('/admin/links/:link_id', function(req, res, next) {
        return res.status(404).json({error: "Not Found"});
    });

    app.post('/admin/links', function(req, res, next) {
        return res.status(404).json({error: "Not Found"});
    });

    app.put('/admin/links/:link_id', function(req, res, next) {
        return res.status(404).json({error: "Not Found"});
    });

    app.delete('/admin/links/:link_id', function(req, res, next) {
        return res.status(404).json({error: "Not Found"});
    });
}
