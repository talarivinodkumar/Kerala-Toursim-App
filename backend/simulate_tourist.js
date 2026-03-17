const axios = require('axios');

const API_URL = 'http://localhost:5000/api/safety';

const simulate = async () => {
    try {
        const indianNames = [
            'Aarav Menon', 'Kavya Nair', 'Vihaan Pillai', 'Ananya Varma',
            'Rohan Nambiar', 'Ishaan Kurup', 'Diya Shenoy', 'Aditya Iyer',
            'Siddharth Reddy', 'Neha Sharma'
        ];
        const randomName = indianNames[Math.floor(Math.random() * indianNames.length)];
        const generatePhone = () => `+91 ${Math.floor(6000000000 + Math.random() * 3000000000)}`;

        // We will loop and create 6 tourists, dropping each into a different beach's danger zone

        const dropLocations = [
            { lat: 10.1430, lng: 76.1770 }, // 1. Cherai (Strong Currents)
            { lat: 8.7310, lng: 76.7060 },  // 2. Varkala (High Tide)
            { lat: 8.4010, lng: 76.9800 },  // 3. Kovalam (Black Sand Deep Drop)
            { lat: 9.4910, lng: 76.3190 },  // 4. Alappuzha (Old Pier Ruin Dropoff)
            { lat: 11.2580, lng: 75.7710 }, // 5. Kozhikode (Deep Sea Anchor Zone)
            { lat: 11.7900, lng: 75.4550 }  // 6. Muzhappilangad (Dharmadam Island Rip Current)
        ];

        for (let i = 0; i < dropLocations.length; i++) {
            const loc = dropLocations[i];
            const randomName = indianNames[Math.floor(Math.random() * indianNames.length)];

            console.log(`\n--- Registering Tourist ${i + 1} ---`);
            const regRes = await axios.post(`${API_URL}/register`, {
                name: randomName,
                phone: generatePhone(),
                emergency_contact: generatePhone()
            });
            const tourist = regRes.data.tourist;

            console.log(`Updating Location and dropping into Beach ${i + 1} danger zone...`);
            let locRes = await axios.post(`${API_URL}/location`, {
                tourist_id: tourist.id,
                lat: loc.lat,
                lng: loc.lng,
                battery_level: Math.floor(Math.random() * 20) + 5 // Random low battery 5-25%
            });

            console.log(`Triggering SOS Alert for ${tourist.name}!`);
            const sosRes = await axios.post(`${API_URL}/sos`, {
                tourist_id: tourist.id,
                lat: loc.lat,
                lng: loc.lng
            });
        }

        console.log('\n✅ Statewide Simulation complete! Check the Admin Dashboard under Tourist Safety.');

    } catch (error) {
        console.error('Simulation error:', error.response?.data || error.message);
    }
};

simulate();
