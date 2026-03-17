const db = require('./config/db');

async function populate() {
    try {
        console.log('Starting population...');

        // Disable foreign key checks for clean wipe
        await db.query('SET FOREIGN_KEY_CHECKS = 0');

        await db.query('DELETE FROM bookings');
        await db.query('DELETE FROM hotel_rooms');
        await db.query('DELETE FROM hotels');
        await db.query('DELETE FROM activities');
        await db.query('DELETE FROM travel_packages');

        // Re-enable foreign key checks
        await db.query('SET FOREIGN_KEY_CHECKS = 1');

        // 1. HOTELS
        await db.query(`INSERT INTO hotels (id, name, rating, price_range, images) VALUES 
            (1, 'Cherai Beach Resort', 5, 'Luxury', '["https://images.unsplash.com/photo-1566073771259-6a8506099945", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"]'),
            (2, 'Le Meridien Cherai', 4, 'Premium', '["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb", "https://images.unsplash.com/photo-1571896349842-33c89424de2d"]'),
            (3, 'Heritage Backwater Villa', 5, 'Luxury', '["https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd", "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"]')`);

        // 2. HOTEL ROOMS
        await db.query(`INSERT INTO hotel_rooms (hotel_id, room_type, price_per_night, capacity, description, image) VALUES 
            (1, 'Luxury Sea View', 4500.00, 2, 'Wake up to the sound of waves in our premium sea-facing suite with a private balcony.', 'https://images.unsplash.com/photo-1590490360182-c33d57733427'),
            (1, 'Garden Cottage', 3200.00, 3, 'Cozy cottages surrounded by tropical greenery, perfect for families.', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a'),
            (2, 'Presidential Suite', 8500.00, 2, 'The ultimate luxury experience with 24/7 butler service and panoramic views.', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304'),
            (3, 'Traditional Backwater View', 5500.00, 2, 'Authentic Kerala architecture meeting modern luxury right on the water edge.', 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7')`);

        // 3. ACTIVITIES
        await db.query(`INSERT INTO activities (id, name, price, available_slots, description, image) VALUES 
            (1, 'Traditional Boat Ride', 1200.00, 20, 'Explore the serene backwaters of Cherai in a traditional country boat during sunset.', 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944'),
            (2, 'Surf Lessons', 2500.00, 10, 'Learn to catch waves from professional instructors on the safe, shallow waters of Cherai.', 'https://images.unsplash.com/photo-1502680390469-be75c86b636f'),
            (3, 'Village Cycling Tour', 800.00, 15, 'Ride through the narrow lanes of Vypin island, visiting local markets and fishing hamlets.', 'https://images.unsplash.com/photo-1541625602330-2277a1c4b6c3'),
            (4, 'Deep Sea Fishing', 5000.00, 5, 'An adventurous half-day trip into the Arabian sea for professional and amateur fishers.', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5')`);

        // 4. TRAVEL PACKAGES
        await db.query(`INSERT INTO travel_packages (id, name, package_type, price, description, includes, image) VALUES 
            (1, 'Honeymoon Bliss', 'Romantic', 15999.00, 'A 3-day premium experience for couples including candle-lit dinner and spa treatment.', '3 Nights Stay, Couple Spa, Candle-light Dinner, Sunset Cruise', 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80'),
            (2, 'Adventure Quest', 'Adventure', 12500.00, 'Designed for thrill-seekers. Includes surfing, kayaking, and backwater exploration.', '2 Nights Stay, Surf Lessons, Kayaking Tour, All Meals', 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200&q=80'),
            (3, 'Kerala Heritage Route', 'Cultural', 18000.00, 'Immerse yourself in local culture with village tours, Kathakali performances and authentic food.', '4 Nights Stay, Cultural Show, Village Tour, Ayurvedic Massage', 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80')`);

        console.log('✅ Population complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Population failed:', err);
        process.exit(1);
    }
}

populate();
