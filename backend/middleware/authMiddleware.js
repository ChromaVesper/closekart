const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Get token from header: Authorization: Bearer TOKEN
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.header('x-auth-token')) {
        // Fallback for any legacy calls
        token = req.header('x-auth-token');
    }

    // Check if not token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user || decoded; // Support both { user: {id} } and { id } payloads depending on sign

        // If the payload from passport just has userId instead of user object:
        if (decoded.userId && !req.user.id) {
            req.user = { id: decoded.userId };
        }

        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
