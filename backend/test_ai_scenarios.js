const axios = require('axios');
const API_URL = 'http://localhost:5000/api/safety';

const runTests = async () => {
    try {
        console.log('--- 🤖 AI RISK DETECTION TEST SUITE ---');

        // Test 1: Repeated Deep Water Proximity
        console.log('\n[TEST 1] Repeated Deep Water Proximity...');
        const reg1 = await axios.post(`${API_URL}/register`, { name: 'Repeated Risk User', phone: '+91 9000000001' });
        const u1 = reg1.data.tourist;

        // Move into Deep Water (ID 1: Cherai Danger Zone: 10.1430, 76.1770) 4 times
        for (let i = 0; i < 4; i++) {
            console.log(`Step ${i + 1}: Moving to Danger Zone...`);
            const res = await axios.post(`${API_URL}/location`, { tourist_id: u1.id, lat: 10.1430, lng: 76.1770, battery_level: 90 });
            console.log(`   Risk Score: ${res.data.riskScore}%`);
        }

        // Test 2: Unusual Movement Pattern (Warping)
        console.log('\n[TEST 2] Unusual Movement Pattern (GPS Warp)...');
        const reg2 = await axios.post(`${API_URL}/register`, { name: 'Fast Mover User', phone: '+91 9000000002' });
        const u2 = reg2.data.tourist;

        console.log('Initial location...');
        await axios.post(`${API_URL}/location`, { tourist_id: u2.id, lat: 10.1416, lng: 76.1783, battery_level: 80 });

        console.log('Warpping 5km instantly...');
        const res2 = await axios.post(`${API_URL}/location`, { tourist_id: u2.id, lat: 10.1800, lng: 76.2200, battery_level: 80 });
        console.log(`   Risk Score: ${res2.data.riskScore}% (Should be higher due to erratic score)`);

        // Test 3: Sunset Alert (Dependent on server time, but we can verify field values)
        console.log('\n[TEST 3] Unsafe Zone Alert (Check Logs for Sunset Logic)...');
        const reg3 = await axios.post(`${API_URL}/register`, { name: 'Sunset User', phone: '+91 9000000003' });
        const u3 = reg3.data.tourist;

        const currentHour = new Date().getHours();
        const isNight = currentHour >= 18 || currentHour < 6;
        console.log(`Current Hour: ${currentHour} (Night: ${isNight})`);

        const res3 = await axios.post(`${API_URL}/location`, { tourist_id: u3.id, lat: 10.1430, lng: 76.1770, battery_level: 15 });
        console.log(`   Risk Score: ${res3.data.riskScore}% (High alert if night + danger + low battery)`);

        console.log('\n✅ AI Tests Completed. Check Admin Dashboard for SOS alerts triggered by AI.');

    } catch (error) {
        console.error('Test failed:', error.response?.data || error.message);
    }
};

runTests();
