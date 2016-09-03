module.exports = function(app) {
    return function(req, res, next) {
        console.log(req.id, new Date(), req.method, req.url);
        next();
    }
}
