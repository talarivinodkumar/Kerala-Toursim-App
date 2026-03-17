const axios = require('axios');
const twilio = require('twilio');
const dotenv = require('dotenv');
dotenv.config();

const sendSMS = async (numbers, message) => {
    try {
        // 1. Check Twilio (Premium Global Standard)
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
            console.log('[SMS Route] Using Twilio API...');
            const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
            const response = await client.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: numbers
            });
            console.log('[Twilio] Success SID:', response.sid);
            return { success: true, isMock: false };
        }

        // 2. Check Fast2SMS (Indian Gateway)
        if (process.env.FAST2SMS_API_KEY && process.env.FAST2SMS_API_KEY !== 'YOUR_FAST2SMS_KEY_HERE' && process.env.FAST2SMS_API_KEY !== 'your_key_here') {
            console.log('[SMS Route] Using Fast2SMS API...');
            const response = await axios.post(
                'https://www.fast2sms.com/dev/bulkV2',
                {
                    route: 'q',
                    message: message,
                    language: 'english',
                    flash: 0,
                    numbers: numbers.replace(/[^0-9]/g, '').slice(-10) // Extract last 10 digits
                },
                {
                    headers: {
                        "authorization": process.env.FAST2SMS_API_KEY,
                        "Content-Type": "application/json"
                    }
                }
            );
            console.log('[Fast2SMS] Success:', response.data);
            return { success: true, isMock: false };
        }

        // 3. Try Textbelt (1 FREE real text per day per IP address - No Account Needed)
        console.log('[SMS Route] Using Free Textbelt API...');
        const textbeltResponse = await axios.post('https://textbelt.com/text', {
            phone: numbers,
            message: message,
            key: 'textbelt', // Free public key limit of 1
        });

        if (textbeltResponse.data.success) {
            console.log('[Textbelt] Real SMS delivered! (Free limit: 1 per day)');
            return { success: true, isMock: false };
        } else {
            console.warn('[Textbelt Limit Exceeded] Falling back to Mock Mode on screen. Error:', textbeltResponse.data.error);
        }

        // 4. Ultimate Fallback -> Developer Mock Mode (Screen display)
        console.warn(`[MOCK SMS] To: ${numbers} | Message: ${message}`);
        return { success: true, isMock: true };

    } catch (error) {
        console.error('[SMS Service Route] Error sending SMS:', error.response ? error.response.data : error.message);
        return { success: false, isMock: false };
    }
}

module.exports = {
    sendSMS
};
