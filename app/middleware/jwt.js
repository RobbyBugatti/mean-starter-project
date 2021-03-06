var jwt = require('jsonwebtoken');
var User = require('../models/User.js');
module.exports = function(app) {
    if(!process.env.JWT_SECRET_KEY) {
        throw "No JWT Token was specified";
    }
    return function(req, res, next) {
        req.user = false;
        if(req.headers['x-urlite-access-token']) {
            var decoded = jwt.verify(req.headers['x-urlite-access-token'], process.env.JWT_SECRET_KEY);
            var email = decoded.email;
            User.findOne({email: email}, function(err, user) {
                if(err) return res.status(500);
                if(user) {
                    req.user = user;
                    next();
                } else {
                    next();
                }
            })
        }
        next();
    };
}
