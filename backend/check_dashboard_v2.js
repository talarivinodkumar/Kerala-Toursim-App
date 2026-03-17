const axios = require('axios');
const API_URL = 'http://localhost:5000/api/safety/dashboard';

async function check() {
    try {
        const res = await axios.get(API_URL);
        if (res.data.emergencyAlerts.length > 0) {
            res.data.emergencyAlerts.forEach(a => {
                console.log(`Alert ID ${a.id}: Name=${a.name}, Beach=${a.location_beach}, Lat=${a.lat}`);
            });
        } else {
            console.log("No alerts found.");
        }
    } catch (err) {
        console.error(err.message);
    }
}
check();
