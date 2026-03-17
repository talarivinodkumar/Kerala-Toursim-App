const db = require('../config/db');
const sendEmail = require('../utils/sendEmail');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const [userExists] = await db.query('SELECT email FROM users WHERE email = ?', [email]);

        if (userExists.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Uses password column as per schema
        const [result] = await db.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );

        res.status(201).json({
            id: result.insertId,
            name,
            email,
            token: generateToken(result.insertId)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        // Check password against password column
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user.id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Forgot Password (Mock)
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash token before saving to DB (optional but good practice, here saving plain for simplicity)
        const passwordResetToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Set expiry to 10 minutes from now
        const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
        // Format for MySQL datetime: YYYY-MM-DD HH:MM:SS
        const formattedExpires = passwordResetExpires.toISOString().slice(0, 19).replace('T', ' ');

        await db.query(
            'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?',
            [passwordResetToken, formattedExpires, user.id]
        );

        // Construct reset URL for frontend
        const frontendUrl = process.env.FRONTEND_URL || 'https://serene-biscochitos-136c3f.netlify.app';
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

        // Always log to console so it works even without email config
        console.log('\n🔑 PASSWORD RESET LINK (also sent via email):');
        console.log('----------------------------------------------');
        console.log(resetUrl);
        console.log('----------------------------------------------\n');

        const htmlMessage = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #1e3a5f;">Keralam — Password Reset</h2>
                <p>You requested a password reset. Click the button below to set a new password:</p>
                <a href="${resetUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; margin: 16px 0;">
                    Reset My Password
                </a>
                <p style="color: #888; font-size: 13px;">This link expires in <strong>10 minutes</strong>. If you did not request this, ignore this email.</p>
                <p style="color: #888; font-size: 12px;">Or copy this link: ${resetUrl}</p>
            </div>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: '🔐 Keralam - Password Reset Link',
                message: `Reset your password here: ${resetUrl} (expires in 10 minutes)`,
                html: htmlMessage
            });
            res.status(200).json({ success: true, data: 'Email sent' });
        } catch (err) {
            console.error('Email send failed (token still valid — use console link above):', err.message);
            // DO NOT clear the token — the console link above still works for 10 minutes
            res.status(200).json({ success: true, data: 'Reset link generated. Check backend console if email fails.' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset Password
// @route   PUT /api/users/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
    const resetToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    try {
        const [users] = await db.query(
            'SELECT * FROM users WHERE reset_password_token = ? AND reset_password_expires > NOW()',
            [resetToken]
        );

        const user = users[0];

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid token' });
        }

        // Set new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        await db.query(
            'UPDATE users SET password = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?',
            [hashedPassword, user.id]
        );

        res.status(200).json({
            success: true,
            data: 'Password updated success',
            token: generateToken(user.id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
const getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const [users] = await db.query('SELECT id, name, email FROM users WHERE id = ?', [id]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Public
const getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, name, email FROM users');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/users/me
// @access  Private
const getCurrentUser = async (req, res) => {
    try {
        // Extract token from header
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        // Verify token
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        
        const [users] = await db.query('SELECT id, name, email FROM users WHERE id = ?', [decoded.id]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(users[0]);
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = { registerUser, loginUser, forgotPassword, resetPassword, getUserById, getAllUsers, getCurrentUser };
