import axios from 'axios';

const api = axios.create({
    baseURL: VITE_API_URL || 'http://localhost:5000/api',
});

// Places
export const getPlaces = () => api.get('/places');
export const getPlace = (id) => api.get(`/places/${id}`);
export const updatePlace = (id, data) => api.put(`/places/${id}`, data);

// Hotels
export const getHotels = () => api.get('/hotels');
export const createHotel = (data) => api.post('/hotels', data);
export const createRoom = (data) => api.post('/hotels/room', data);

// Activities
export const getActivities = () => api.get('/activities');
export const createActivity = (data) => api.post('/activities', data);

// Packages
export const getPackages = () => api.get('/packages');
export const createPackage = (data) => api.post('/packages', data);

// Romantic Messages
export const getRomanticMessages = () => api.get('/romantic');

// Live Stats
export const getLiveStats = () => api.get('/live/stats');
export const updateLiveStats = (data) => api.post('/live/update', data);

// Bookings
export const updateBookingStatus = (id, data) => api.put(`/bookings/${id}`, data);

// ========== Safety System ==========
export const getSafetyDashboard = (beachId) => api.get(`/safety/dashboard${beachId ? `?beach_id=${beachId}` : ''}`);
export const getSafetyBeaches = () => api.get('/safety/beaches');
export const registerTourist = (data) => api.post('/safety/register', data);
export const updateLocation = (data) => api.post('/safety/location', data);
export const triggerSOS = (data) => api.post('/safety/sos', data);

// ========== NEW: Kerala State Monitoring ==========
// Auto-detect nearest beach from GPS
export const getNearestBeach = (lat, lng) => api.get(`/safety/nearest-beach?lat=${lat}&lng=${lng}`);

// Full auto-track flow
export const autoTrack = (data) => api.post('/safety/auto-track', data);

// Kerala state-wide dashboard
export const getStateDashboard = (beachId) => api.get(`/safety/state-dashboard${beachId ? `?beach_id=${beachId}` : ''}`);

// All Kerala beaches with stats
export const getKeralaBeaches = () => api.get('/safety/kerala-beaches');

// 300m GEO-FENCE PROXIMITY CHECK
// Returns: inside_geofence, beach, current_zone, risk_score, risk_level
export const geoCheck = (lat, lng, touristId) =>
    api.get(`/safety/geo-check?lat=${lat}&lng=${lng}${touristId ? `&tourist_id=${touristId}` : ''}`);

export default api;
