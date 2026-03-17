const db = require('../config/db');

// @desc    Get all romantic messages
// @route   GET /api/romantic
// @access  Public
const getMessages = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM romantic_messages ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a romantic message
// @route   POST /api/romantic
// @access  Public
const createMessage = async (req, res) => {
    const { title, message } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO romantic_messages (title, message) VALUES (?, ?)',
            [title || 'For You ❤️', message]
        );
        res.status(201).json({ id: result.insertId, title, message });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getMessages, createMessage };
