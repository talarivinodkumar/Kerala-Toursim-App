const db = require('../config/db');

// @desc    Get all activities
const getActivities = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM activities');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new activity
const createActivity = async (req, res) => {
    const { name, price, available_slots, description, image } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO activities (name, price, available_slots, description, image) VALUES (?, ?, ?, ?, ?)',
            [name, price, available_slots, description, image]
        );
        res.status(201).json({ message: 'Activity added', id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getActivities, createActivity };
