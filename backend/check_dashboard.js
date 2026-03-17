const axios = require('axios');
const API_URL = 'http://localhost:5000/api/safety/dashboard';

async function check() {
    try {
        const res = await axios.get(API_URL);
        console.log(JSON.stringify(res.data.emergencyAlerts, null, 2));
    } catch (err) {
        console.error(err.message);
    }
}
check();
