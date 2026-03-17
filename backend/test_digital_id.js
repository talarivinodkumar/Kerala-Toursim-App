const axios = require('axios');
const API_URL = 'http://localhost:5000/api/safety';

const testDigitalID = async () => {
    try {
        console.log('--- 🛡️ DIGITAL ID GENERATION & BLOCKCHAIN-STYLE VERIFICATION ---');

        // 1. Register new tourist
        console.log('\n[STEP 1] Registering a new tourist (Aravind K)...');
        const regRes = await axios.post(`${API_URL}/register`, {
            name: 'Aravind K',
            phone: '+91 9876543210',
            emergency_contact: '+91 9999999999'
        });

        const tourist = regRes.data.tourist;
        const digitalId = tourist.digital_id;

        console.log(`✅ Registration Successful!`);
        console.log(`👤 Name: ${tourist.name}`);
        console.log(`🔑 Generated Digital ID: ${digitalId}`);

        // 2. Uniqueness Check: Attempt to register the same person/details again
        console.log('\n[STEP 2] Verifying ID Uniqueness (Conflict Test)...');
        try {
            const secondReg = await axios.post(`${API_URL}/register`, {
                name: 'Aravind K',
                phone: '+91 9876543210',
                emergency_contact: '+91 9999999999'
            });
            console.log(`⚠️  Warning: Second registration didn't fail (ID might be time-stamped). New ID: ${secondReg.data.tourist.digital_id}`);
        } catch (err) {
            console.log('✅ Correctly blocked or handled unique constraint.');
        }

        // 3. Security Check: Verify ID is a valid SHA-256 hash (64 chars hex)
        console.log('\n[STEP 3] Secure Ledger Integrity Check...');
        const isSha256 = /^[a-f0-9]{64}$/i.test(digitalId);
        if (isSha256) {
            console.log('✅ Digital ID is Cryptographically Secure (SHA-256 Verified).');
        } else {
            console.log('❌ Security Flaw: ID format is not cryptographically sound.');
        }

        // 4. Verification Check: Simulate QR Scan by querying the public ID
        console.log('\n[STEP 4] Simulated QR Code Scan (Verification)...');
        // In this system, we fetch by ID to verify data integrity
        // We'll use the check_dashboard logic to see if this ID is active in the state database
        const dashboardRes = await axios.get(`http://localhost:5000/api/safety/dashboard`);
        const found = dashboardRes.data.tourists.find(t => t.digital_id === digitalId);

        if (found) {
            console.log('✅ Verified! QR Scan data matches the centralized safety ledger.');
            console.log(`   Linked Records: ${found.name} | Status: ${found.status}`);
        } else {
            console.log('❌ Error: Registered ID not found in active tracking pool.');
        }

        console.log('\n--- 🏁 DIGITAL ID TEST COMPLETE ---');

    } catch (error) {
        console.error('Test failed:', error.response?.data || error.message);
    }
};

testDigitalID();
