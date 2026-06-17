const allowRoles = (...roles) => {
    return (req, res, next) => {

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Only ${roles.join(", ")} can access this resource`
            });
        }

        next();
    };
};

module.exports = allowRoles;