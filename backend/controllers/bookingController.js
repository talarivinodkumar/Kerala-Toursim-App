const db = require('../config/db');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
    const { user_id, booking_type, item_id, check_in, check_out, guests, total_price } = req.body;

    try {
        const [result] = await db.query(
            'INSERT INTO bookings (user_id, booking_type, item_id, check_in, check_out, guests, total_price) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [user_id, booking_type, item_id, check_in || null, check_out || null, guests, total_price]
        );

        res.status(201).json({
            message: 'Booking created successfully!',
            booking_id: result.insertId
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = async (req, res) => {
    const { user_id } = req.query; // Usually from auth middleware, but using query for now

    try {
        const [rows] = await db.query(
            `SELECT b.*, 
                CASE 
                    WHEN b.booking_type = 'hotel' THEN hr.room_type 
                    WHEN b.booking_type = 'activity' THEN a.name 
                    WHEN b.booking_type = 'package' THEN p.name 
                END as item_name
             FROM bookings b
             LEFT JOIN hotel_rooms hr ON b.item_id = hr.id AND b.booking_type = 'hotel'
             LEFT JOIN activities a ON b.item_id = a.id AND b.booking_type = 'activity'
             LEFT JOIN travel_packages p ON b.item_id = p.id AND b.booking_type = 'package'
             WHERE b.user_id = ?
             ORDER BY b.created_at DESC`,
            [user_id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
const getAllBookings = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT b.*, u.name as user_name, u.email as user_email
             FROM bookings b
             JOIN users u ON b.user_id = u.id
             ORDER BY b.created_at DESC`
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateBookingStatus = async (req, res) => {
    const { id } = req.params;
    const { status, payment_status } = req.body;

    try {
        await db.query(
            'UPDATE bookings SET status = ?, payment_status = ? WHERE id = ?',
            [status, payment_status, id]
        );
        res.json({ message: 'Booking status updated successfully!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createBooking, getMyBookings, getAllBookings, updateBookingStatus };
