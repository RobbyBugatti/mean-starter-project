var mongoose                = require('mongoose');
var bcrypt                  = require('bcryptjs');
var validator               = require('validator');
const SALT_WORK_FACTOR      = 10;
const MAX_LOGIN_ATTEMPTS    = 5;
const LOCK_TIME             = 2 * 60 * 60 * 1000;

var UserSchema = new mongoose.Schema({
    email           : { type: String,   unique: true },
    password        : { type: String,   required: true },
    admin           : { type: Boolean,  required: true,     default: false},
    created_at      : Date,
    updated_at      : Date,
    last_login      : Date,
    last_ip         : String,
    loginAttempts   : { type: Number,   default: 0 },
    lockUntil       : { type: Number }
});

var reasons = UserSchema.statics.failedLogin = {
    NOT_FOUND           : 0,
    PASSWORD_INCORRECT  : 1,
    MAX_ATTEMPTS        : 2
};

UserSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

UserSchema.pre('save', function(next) {
    var user = this;
    var current_date = new Date();

    this.updated_at = current_date;
    if(!this.created_at) this.created_at = current_date;

    if(!user.isModified('password')) {
        return next();
    }

    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if(err) return next(err);
        bcrypt.hash(user.password, salt, function(err, hash) {
            if(err) return next(err);
            user.password = hash;
            next();
        })
    })
})

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if(err) return cb(err);
        cb(null, isMatch);
    })
}

UserSchema.methods.incLoginAttempts = function(cb) {
    if(this.lockUntil && this.lockUntil < Date.now()) {
        return this.update({
            $set: {loginAttempts : 1},
            $unset: {lockUntil: 1}
        }, cb);
    }

    var updates = { $inc: { loginAttempts: 1 } };


    if(this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.locked) {
        updates.$set = {lockUntil: Date.now() + LOCK_TIME };
    }
    return this.update(updates, cb);
}

UserSchema.statics.getAuthenticated = function(email, password, cb) {
    this.findOne({ email : email}, function(err, user) {
        if(err) return cb(err);

        if(!user) {
            return cb(null, null, reasons.NOT_FOUND);
        }

        if(user.isLocked) {
            return user.incLoginAttempts(function(err) {
                if(err) return cb(err);
                return cb(null, null, reasons.MAX_ATTEMPTS);
            });
        }

        user.comparePassword(password, function(err, isMatch) {
            if(err) return cb(err);

            if(isMatch) {
                if(!user.loginAttempts && !user.lockUntil) return cb(null, user);

                var updates = {
                    $set: {loginAttempts: 0},
                    $unset: { lockUntil : 1}
                };
                return user.update(updates, function(err) {
                    if(err) return cb(err);
                    return cb(null, user);
                });
            }

            user.incLoginAttempts(function(err) {
                if(err) return cb(err);
                return cb(null, null, reasons.PASSWORD_INCORRECT);
            })
        })
    })
}

var User = mongoose.model('User', UserSchema);
module.exports = User;
