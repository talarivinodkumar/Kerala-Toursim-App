const db = require('./config/db');

const addMorePackages = async () => {
    try {
        console.log('--- ADDING MORE PROFESSIONAL PACKAGES ---');

        const packagesToAdd = [
            {
                name: 'Adventure Quest',
                description: 'For the thrill seekers! Best of sea and backwaters.',
                price: 3500.00,
                includes: 'Water Sports, Boat Ride, Sunset Cruise, Refreshments',
                package_type: 'Adventure',
                image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80'
            },
            {
                name: 'Heritage & Culture',
                description: 'Experience the soul of Kerala with local temple visits and traditional houseboat dining.',
                price: 4500.00,
                includes: 'Temple Tour, Private Houseboat Lunch, Local Guide, Traditional Welcome',
                package_type: 'Cultural',
                image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80'
            },
            {
                name: 'Premium Family Escape',
                description: 'The ultimate luxury getaway for the whole family.',
                price: 8000.00,
                includes: 'Luxury Suite, All Meals included, Activity Pass, Private Beach Area',
                package_type: 'Premium',
                image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80'
            }
        ];

        for (const pkg of packagesToAdd) {
            // Check if package already exists to avoid duplicates
            const [exists] = await db.query('SELECT id FROM travel_packages WHERE name = ?', [pkg.name]);
            if (exists.length === 0) {
                await db.query(`INSERT INTO travel_packages (name, description, price, includes, package_type, image) VALUES (?, ?, ?, ?, ?, ?)`,
                    [pkg.name, pkg.description, pkg.price, pkg.includes, pkg.package_type, pkg.image]);
                console.log(`✅ Added ${pkg.name}`);
            } else {
                console.log(`ℹ️ ${pkg.name} already exists`);
            }
        }

        console.log('--- PACKAGES UPDATED ---');
        process.exit();
    } catch (error) {
        console.error('❌ Error Adding Packages:', error.message);
        process.exit(1);
    }
};

addMorePackages();
