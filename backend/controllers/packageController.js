const db = require('../config/db');

// @desc    Get all travel packages
const getPackages = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM travel_packages');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new package
const createPackage = async (req, res) => {
    const { name, package_type, price, description, includes, image } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO travel_packages (name, package_type, price, description, includes, image) VALUES (?, ?, ?, ?, ?, ?)',
            [name, package_type, price, description, includes, image]
        );
        res.status(201).json({ message: 'Package added', id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getPackages, createPackage };
