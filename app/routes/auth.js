var User        = require('../models/User.js');
var validator   = require('validator');
var jwt         = require('jsonwebtoken');
module.exports = function(app) {
    // POST '/login'
    app.post('/login', function(req, res, next) {
        User.getAuthenticated(req.body.email, req.body.password, function(err, user, reason) {
            if(err) return res.status(500).json({error: "An unexpected error occured"});
            if (user) {
                // handle login success
                return res.status(200).json({
                    access_token: jwt.sign({
                        email       : user.email,
                        created_at  : user.created_at,
                        admin       : user.admin
                    }, process.env.JWT_SECRET_KEY)
                })
            }
            // otherwise we can determine why we failed
            var reasons = User.failedLogin;
            switch (reason) {
                case reasons.NOT_FOUND:
                case reasons.PASSWORD_INCORRECT:
                    // note: these cases are usually treated the same - don't tell
                    // the user *why* the login failed, only that it did
                    return res.status(400).json({error: "Invalid Login"});
                    break;
                case reasons.MAX_ATTEMPTS:
                    // send email or otherwise notify user that account is
                    // temporarily locked
                    return res.status(400).json({error: "Your account is currently locked. Please try again later"});
                    break;
                default:
                    return res.status(500).json({error: "An unexpected error occured"});
            }
        })
    });
    // POST '/register'
    app.post('/register', function(req, res, next) {
        if(!req.body.email || !validator.isEmail(req.body.email)) { return res.status(400).json({error: "Invalid Email supplied"})}
        if(!req.body.password || req.body.password.length < 8 || !validator.isAlphanumeric(req.body.password)) return res.status(400).json({error: "Invalid Password Supplied"});
        if(req.body.password !== req.body.confirm) return res.status(400).json({error: "Passwords do not match"});

        var user = User({
            email: req.body.email,
            password: req.body.password
        });

        user.save(function(err) {
            if(err) {
                return res.status(500).json({error: "We were unable to register you with those details"});
            };
            return res.status(201).json();
        })
    });

    // POST '/forgot_password'
    app.post('/forgot_password', function(req, res, next) {
        return res.status(404).json({error: "Not Found"});
    });

    // POST '/reset_password'
    app.post('/reset_password', function(req, res, next) {
        return res.status(404).json({error: "Not Found"});
    });
};
