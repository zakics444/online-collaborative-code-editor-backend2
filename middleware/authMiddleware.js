const jwt = require('jsonwebtoken');  // Import JWT

// Authentication Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');  // Get token from request headers
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });  // No token provided
    }

    try {
        // Verify token and extract the payload
        const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
        req.user = decoded;  // Attach user info to request object
        next();  // Proceed to the next middleware or route handler
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

module.exports = authMiddleware;  // Export middleware
