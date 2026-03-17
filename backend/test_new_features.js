const axios = require('axios');
const API_URL = 'http://localhost:5000/api/safety';

const runTests = async () => {
    try {
        console.log('--- TESTING NEW DIGITAL ID FEATURES ---');

        // 1. Send OTP
        console.log('\n[STEP 1] Requesting OTP for +91 9876543210...');
        let sendOtpRes = await axios.post(`${API_URL}/send-otp`, { phone: '+91 9876543210' });
        console.log('OTP Result:', sendOtpRes.data.message);

        // 2. Verify OTP
        console.log('\n[STEP 2] Verifying OTP...');
        let verifyOtpRes = await axios.post(`${API_URL}/verify-otp`, { phone: '+91 9876543210', otp: '123456' });
        console.log('Verify Result:', verifyOtpRes.data.message);
        let tourist = verifyOtpRes.data.tourist;
        console.log(`Tourist logged in: ${tourist.name}, ID: ${tourist.id}`);

        // 3. Report Incident
        console.log('\n[STEP 3] Reporting Incident...');
        let incRes = await axios.post(`${API_URL}/incident`, {
            tourist_id: tourist.id,
            description: "Spotted a massive jellyfish near the rocky area.",
            lat: 10.1416, lng: 76.1783
        });
        console.log('Incident Result:', incRes.data.message);

        // 4. Trigger SOS
        console.log('\n[STEP 4] Triggering SOS Emergency...');
        let sosRes = await axios.post(`${API_URL}/sos`, {
            tourist_id: tourist.id,
            lat: 10.1416,
            lng: 76.1783
        });
        console.log('SOS Result:', sosRes.data.message);

        console.log('\n--- ALL TESTS PASSED! ---');
    } catch (e) {
        console.error('Test Failed:', e.response?.data || e.message);
    }
};

runTests();
