const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Protect routes
const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

            // Get user from token
            const [users] = await db.query(
                'SELECT id, name, email, role FROM users WHERE id = ?',
                [decoded.id]
            );

            if (users.length === 0) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            req.user = users[0];
            next();
        } catch (error) {
            console.error('Auth error:', error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Admin middleware
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };
