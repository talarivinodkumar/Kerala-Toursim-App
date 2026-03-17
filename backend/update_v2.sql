USE cherai_tourism;

-- Update hotels to handle more details if needed
-- Adding a rooms table for specific room bookings
CREATE TABLE IF NOT EXISTS hotel_rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    room_type VARCHAR(255) NOT NULL,
    price_per_night DECIMAL(10, 2) NOT NULL,
    capacity INT DEFAULT 2,
    description TEXT,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    available_slots INT NOT NULL,
    description TEXT,
    image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Travel Packages table
CREATE TABLE IF NOT EXISTS travel_packages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    includes TEXT, -- Store as JSON or comma-separated
    package_type VARCHAR(50), -- 'Basic', 'Romantic', etc.
    image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings Table (Unified for all booking types)
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    booking_type ENUM('hotel', 'activity', 'package') NOT NULL,
    item_id INT NOT NULL, -- references id of hotel_rooms, activities, or travel_packages
    check_in DATE, -- applicable for hotels
    check_out DATE, -- applicable for hotels
    guests INT DEFAULT 1,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('Pending', 'Confirmed', 'Cancelled', 'Completed') DEFAULT 'Pending',
    payment_status ENUM('Unpaid', 'Paid') DEFAULT 'Unpaid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert Room Data for Sample Hotel
INSERT INTO hotel_rooms (hotel_id, room_type, price_per_night, capacity, description) VALUES
(1, 'Standard Room', 2500.00, 2, 'Comfortable room with essential amenities'),
(1, 'Sea View Room', 4500.00, 2, 'Breathtaking view of the Cherai Beach waves'),
(1, 'Premium Beach Villa', 7000.00, 3, 'Luxury villa with private beach access');

-- Insert Sample Activities
INSERT INTO activities (name, price, available_slots, description, image) VALUES
('Boat Ride', 800.00, 20, 'Explore the backwaters of Cherai in a traditional boat.', 'https://images.unsplash.com/photo-1544526226-d4568090ffb8?auto=format&fit=crop&w=800&q=80'),
('Water Sports', 1500.00, 10, 'Thrilling jet ski and banana boat rides.', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80'),
('Sunset Cruise', 1200.00, 15, 'Romantic sunset view from the middle of the sea.', 'https://images.unsplash.com/photo-1544473244-f689027d1f03?auto=format&fit=crop&w=800&q=80'),
('Beach Photoshoot', 2000.00, 5, 'Professional photography session at the shore.', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80');

-- Insert Sample Packages
INSERT INTO travel_packages (name, description, price, includes, package_type, image) VALUES
('Basic Package', 'Perfect for a quick beach getaway.', 1500.00, 'Beach Visit, Lunch, Sunset View', 'Basic', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'),
('Romantic Surprise', 'The ultimate experience for couples.', 5000.00, 'Candlelight Dinner, Photography, Private Walk, Luxury Stay Discount', 'Romantic', 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=800&q=80');
