const axios = require('axios');

const testApi = async () => {
    try {
        const response = await axios.get('http://localhost:5000/api/packages');
        console.log('API Status:', response.status);
        console.log('Data Length:', response.data.length);
        console.log('Sample Data:', JSON.stringify(response.data[0], null, 2));
    } catch (error) {
        console.error('API Error:', error.message);
    }
};

testApi();
