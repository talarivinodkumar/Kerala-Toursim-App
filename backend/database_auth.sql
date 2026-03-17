USE AuthSystemhello;

-- Ensure users table exists (User provided this, but good to ensure)
CREATE TABLE IF NOT EXISTS users (
    ID int primary key auto_increment,
    name varchar(100),
    email varchar(100),
    passwordHash varchar(150),
    createdAt datetime default Now()
);

-- Re-create Tourism Tables so the app doesn't crash
CREATE TABLE IF NOT EXISTS places (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT,
    images JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hotels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    rating DECIMAL(2,1) DEFAULT 0,
    price_range VARCHAR(50),
    images JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS romantic_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) DEFAULT 'For You ❤️',
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Sample Data if empty
INSERT IGNORE INTO places (name, location, description, images) VALUES 
('Cherai Beach', 'Vypin Island, Kochi', 'Known as the Golden Beach of Kerala...', '["https://images.unsplash.com/photo-1590053912644-656df877299a?auto=format&fit=crop&w=800&q=80"]'),
('Aluva Manappuram', 'Aluva, Kochi', 'A famous temple and river bank on the Periyar River...', '["https://images.unsplash.com/photo-1629081703652-325514cb8311?auto=format&fit=crop&w=800&q=80"]');

INSERT IGNORE INTO hotels (name, rating, price_range, images) VALUES
('Cherai Beach Resort', 4.5, '$$$', '["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"]');
