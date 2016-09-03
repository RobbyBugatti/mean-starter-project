var User = require('../../models/User.js');
module.exports = function(app) {
    app.get('/api/me', function(req, res, next) {
        console.log(req.user);
        User.findOne({_id: req.user._id}, '_id email created_at updated_at admin', function(err, user) {
            if(err) return res.status(500).json({error: "An unexpected error occured"});
            return res.json({
                user: user
            })
        })
    });

    app.post('/api/me', function(res, req, next) {
        return res.code(404).json({error: "Not Found"});
    });
}
