const db = require('../config/db');

// @desc    Get all hotels with rooms
const getHotels = async (req, res) => {
    try {
        const [hotels] = await db.query('SELECT * FROM hotels');
        const [rooms] = await db.query('SELECT * FROM hotel_rooms');

        // Combine hotels with their rooms
        const hotelsWithRooms = hotels.map(hotel => ({
            ...hotel,
            rooms: rooms.filter(room => room.hotel_id === hotel.id)
        }));

        res.json(hotelsWithRooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new hotel
const createHotel = async (req, res) => {
    const { name, rating, price_range, images } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO hotels (name, rating, price_range, images) VALUES (?, ?, ?, ?)',
            [name, rating, price_range, JSON.stringify(images)]
        );
        res.status(201).json({ message: 'Hotel added', id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new room for a hotel
const createRoom = async (req, res) => {
    const { hotel_id, room_type, price_per_night, capacity, description, image } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO hotel_rooms (hotel_id, room_type, price_per_night, capacity, description, image) VALUES (?, ?, ?, ?, ?, ?)',
            [hotel_id, room_type, price_per_night, capacity, description, image]
        );
        res.status(201).json({ message: 'Room added', id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getHotels, createHotel, createRoom };
