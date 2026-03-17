const db = require('../config/db');

// @desc    Get all places
// @route   GET /api/places
// @access  Public
const getPlaces = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM places');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get place by ID
// @route   GET /api/places/:id
// @access  Public
const getPlaceById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM places WHERE id = ?', [req.params.id]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ message: 'Place not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updatePlace = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
        await db.query(
            'UPDATE places SET name = ?, description = ? WHERE id = ?',
            [name, description, id]
        );
        res.json({ message: "Place updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getPlaces, getPlaceById, updatePlace };
