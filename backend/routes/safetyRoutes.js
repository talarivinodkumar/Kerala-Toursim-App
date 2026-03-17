const express = require('express');
const router = express.Router();
const safetyController = require('../controllers/safetyController');

// ========== Tourist App Routes ==========
// Register new tourist
router.post('/register', safetyController.registerTourist);

// AUTO-DETECT nearest beach from GPS coordinates
router.get('/nearest-beach', safetyController.getNearestBeach);

// GEO-FENCE CHECK: 300m proximity detection with zone + risk score
router.get('/geo-check', safetyController.geoCheck);

// AUTO-TRACK: Full flow (GPS → Nearest Beach → Geo-fence → Risk → Alert)
router.post('/auto-track', safetyController.autoTrack);

// Update tourist location (legacy + enhanced)
router.post('/location', safetyController.updateLocation);

// SOS Emergency
router.post('/sos', safetyController.triggerSOS);

// ========== Auth / Digital ID Routes ==========
router.post('/send-otp', safetyController.sendOTP);
router.post('/verify-otp', safetyController.verifyOTP);

// ========== Incident Reports ==========
router.post('/incident', safetyController.reportIncident);
router.get('/incident', safetyController.getIncidentReports);

// ========== SOS History ==========
router.get('/sos-history/:tourist_id', safetyController.getSOSHistory);

// ========== Admin Routes ==========
// Legacy admin dashboard
router.get('/dashboard', safetyController.getAdminDashboard);

// NEW: Kerala State Monitoring Dashboard
router.get('/state-dashboard', safetyController.getStateDashboard);

// NEW: Get all Kerala beaches with stats
router.get('/kerala-beaches', safetyController.getKeralaBeaches);

// Get beaches and zones (legacy)
router.get('/beaches', safetyController.getBeachesAndZones);

// Add geo-fence zone
router.post('/zones', safetyController.addZone);

module.exports = router;
