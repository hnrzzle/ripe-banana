module.exports = function(requiredRole) {
    return (req, res, next) => {
        if(req.reviewer.roles.every(r => r !== requiredRole)) {
            next({
                status: 403,
                error: `requires ${requiredRole} role`
            });
        }
        else next();
    };
};