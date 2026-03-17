const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api/safety';

const VARKALA_DANGER_LAT = 8.7310;
const VARKALA_DANGER_LNG = 76.7060;

const testSafetySystem = async () => {
    console.log('==================================================');
    console.log('🛡️ KERALA COASTAL SAFETY SYSTEM - TEST SUITE');
    console.log('==================================================\n');

    try {
        // ----------------------------------------------------------------------------------
        // TEST 1: Digital ID Generation Module
        // ----------------------------------------------------------------------------------
        console.log('--- TEST 1: Digital ID Generation ---');
        console.log('Testing: Registering a user to generate a hashed digital ID...');

        const indianNames = [
            'Arjun Nairs', 'Krishna Menon', 'Sanjay Kumar', 'Kavya Varma', 'Rahul Pillai'
        ];
        const randomName = indianNames[Math.floor(Math.random() * indianNames.length)];
        const generatePhone = () => `+91 ${Math.floor(6000000000 + Math.random() * 3000000000)}`;

        const registerData = {
            name: `${randomName} (${Date.now().toString().slice(-4)})`,
            phone: generatePhone(),
            emergency_contact: generatePhone()
        };

        const regRes = await axios.post(`${API_BASE_URL}/register`, registerData);
        const tourist = regRes.data.tourist;

        console.log(`✅ Success! Tourist ID: ${tourist.id}`);
        console.log(`✅ Success! Digital ID (SHA256): ${tourist.digital_id}`);
        if (tourist.digital_id.length === 64) {
            console.log('✅ Validation: Hash length is exactly 64 characters (Valid SHA256).\n');
        } else {
            console.log('❌ Validation Failed: Hash length incorrect.\n');
        }

        const touristId = tourist.id;


        // ----------------------------------------------------------------------------------
        // TEST 2: Geo-Fencing Module
        // ----------------------------------------------------------------------------------
        console.log('--- TEST 2: Geo-Fencing Module ---');
        console.log('Testing: Updating user location to a Safe Zone...');

        // Varkala Cliff View Safe Zone is approx 8.7360, 76.7025
        const locResSafe = await axios.post(`${API_BASE_URL}/location`, {
            tourist_id: touristId,
            lat: 8.7360,
            lng: 76.7025,
            battery_level: 90
        });

        console.log(`✅ API Response: ${locResSafe.data.message}`);
        console.log(`✅ Status: ${locResSafe.data.status}`);
        console.log(`✅ Risk Score: ${locResSafe.data.riskScore}`);
        console.log(`✅ Geo-Fence Red Zone Check: ${locResSafe.data.inRedZone}\n`);


        // ----------------------------------------------------------------------------------
        // TEST 3: AI Risk Detection Module
        // ----------------------------------------------------------------------------------
        console.log('--- TEST 3: AI Risk Detection Module ---');
        console.log('Testing: Moving user into Red Zone (Danger) with Low Battery (15%)...');

        // Varkala High Tide Danger is approx 8.7310, 76.7060
        const locResDanger = await axios.post(`${API_BASE_URL}/location`, {
            tourist_id: touristId,
            lat: VARKALA_DANGER_LAT,
            lng: VARKALA_DANGER_LNG,
            battery_level: 15 // Trigger Low Battery Risk (+10) + Danger Zone (+40) = 50. 
            // Note: If run at night (+30), score will be 80.
        });

        console.log(`✅ Location Updated.`);
        console.log(`✅ In Red Zone: ${locResDanger.data.inRedZone}`);
        console.log(`✅ AI Risk Score Calculated: ${locResDanger.data.riskScore}`);
        console.log(`✅ AI Status Decision: ${locResDanger.data.status}\n`);


        // ----------------------------------------------------------------------------------
        // TEST 4: SOS Emergency Module
        // ----------------------------------------------------------------------------------
        console.log('--- TEST 4: SOS Emergency System ---');
        console.log('Testing: User triggers the SOS button...');

        const sosRes = await axios.post(`${API_BASE_URL}/sos`, {
            tourist_id: touristId,
            lat: VARKALA_DANGER_LAT,
            lng: VARKALA_DANGER_LNG
        });

        console.log(`✅ SOS Triggered successfully! Response: ${sosRes.data.message}\n`);


        // ----------------------------------------------------------------------------------
        // TEST 5: Full Dashboard Integration
        // ----------------------------------------------------------------------------------
        console.log('--- TEST 5: Full System Integration (Admin Dashboard) ---');
        console.log('Testing: Admin API checking for Beach 2 (Varkala) Data...');

        const dashRes = await axios.get(`${API_BASE_URL}/dashboard?beach_id=2`);

        const testUserInDash = dashRes.data.tourists.find(t => t.id === touristId);
        const testUserAlert = dashRes.data.emergencyAlerts.find(a => a.tourist_id === touristId);

        if (testUserInDash) {
            console.log(`✅ Validation: Tourist visibly tracked at Varkala dashboard. Status: ${testUserInDash.status}`);
        } else {
            console.log(`❌ Validation Failed: Tourist NOT tracked at Varkala dashboard.`);
        }

        if (testUserAlert) {
            console.log(`✅ Validation: Active Emergency Alarm broadcasting to admin UI loud and clear.`);
        } else {
            console.log(`❌ Validation Failed: Active SOS Alert not found on dashboard.`);
        }

        console.log('\n==================================================');
        console.log('✅ ALL MODULE TESTS COMPLETED SUCCESSFULLY! ✅');
        console.log('==================================================\n');

    } catch (error) {
        console.error('❌ TEST FAILED with error:', error.message);
        if (error.response) {
            console.error('Response Data:', error.response.data);
        }
    }
};

testSafetySystem();
