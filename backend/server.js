const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Routes
const placeRoutes = require('./routes/placeRoutes');
const romanticRoutes = require('./routes/romanticRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const safetyRoutes = require('./routes/safetyRoutes');

dotenv.config();

// Test Database Connection
connectDB.query('SELECT 1')
    .then(() => console.log('✅ MySQL Database Connected Successfully!'))
    .catch(err => console.error('❌ MySQL Connection Error:', err.message));

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/live', require('./routes/liveRoutes'));
app.use('/api/places', placeRoutes);
app.use('/api/romantic', romanticRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/packages', require('./routes/packageRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/safety', safetyRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
