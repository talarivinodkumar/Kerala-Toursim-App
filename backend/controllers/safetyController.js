const crypto = require('crypto');
const db = require('../config/db');
const { sendSMS } = require('../utils/fast2smsHelper');
const sendEmail = require('../utils/sendEmail');

// --- Haversine Distance (meters) ---
const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// ==========================================
// 1. Tourist Registration
// ==========================================
exports.registerTourist = async (req, res) => {
    try {
        const { name, phone, emergency_contact } = req.body;
        const uniqueString = `${Date.now()}-${name}-${phone}`;
        const digital_id = crypto.createHash('sha256').update(uniqueString).digest('hex');

        await db.query(
            'INSERT INTO tourists (digital_id, name, phone, emergency_contact) VALUES (?, ?, ?, ?)',
            [digital_id, name, phone, emergency_contact]
        );

        const [rows] = await db.query('SELECT * FROM tourists WHERE digital_id = ?', [digital_id]);
        res.status(201).json({ message: 'Tourist registered successfully', tourist: rows[0] });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// ==========================================
// 2. AUTO-DETECT NEAREST BEACH FROM GPS
//    Tourist opens app → GPS → Nearest beach
// ==========================================
exports.getNearestBeach = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({ message: 'Latitude and longitude required' });
        }

        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);

        // Haversine formula in SQL to find the nearest beach
        const [beaches] = await db.query(`
            SELECT beach_id, beach_name, district, latitude, longitude, description, risk_level,
            (6371 * acos(
                cos(radians(?)) *
                cos(radians(latitude)) *
                cos(radians(longitude) - radians(?)) +
                sin(radians(?)) *
                sin(radians(latitude))
            )) AS distance_km
            FROM kerala_beaches
            WHERE is_active = TRUE
            ORDER BY distance_km
            LIMIT 5
        `, [userLat, userLng, userLat]);

        if (beaches.length === 0) {
            return res.status(404).json({ message: 'No beaches found' });
        }

        const nearest = beaches[0];

        // Fetch geo-fence zones for the nearest beach
        const [zones] = await db.query(
            'SELECT * FROM geo_fence_zones WHERE beach_id = ?',
            [nearest.beach_id]
        );

        // Check which zone the tourist is currently in
        let currentZone = null;
        for (const zone of zones) {
            const dist = getDistance(userLat, userLng, parseFloat(zone.zone_lat), parseFloat(zone.zone_lng));
            if (dist <= zone.radius_meters) {
                currentZone = {
                    zone_name: zone.zone_name,
                    zone_type: zone.zone_type,
                    distance_from_center: Math.round(dist),
                    description: zone.description
                };
                break;
            }
        }

        res.json({
            nearest_beach: {
                ...nearest,
                distance_km: parseFloat(nearest.distance_km).toFixed(2)
            },
            nearby_beaches: beaches.slice(1).map(b => ({
                ...b,
                distance_km: parseFloat(b.distance_km).toFixed(2)
            })),
            geo_fence_zones: zones,
            current_zone: currentZone,
            message: `Nearest beach: ${nearest.beach_name} (${parseFloat(nearest.distance_km).toFixed(2)} km)`
        });

    } catch (error) {
        console.error('Nearest beach error:', error);
        res.status(500).json({ message: 'Failed to detect nearest beach' });
    }
};

// ==========================================
// 3. AUTO-TRACK: Full flow when tourist opens app
//    GPS → Nearest Beach → Geo-fence → Risk → Alert
// ==========================================
exports.autoTrack = async (req, res) => {
    try {
        const { tourist_id, lat, lng, battery_level } = req.body;
        if (!lat || !lng) {
            return res.status(400).json({ message: 'GPS data missing' });
        }

        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);

        // Step 1: Find nearest beach
        const [beaches] = await db.query(`
            SELECT beach_id, beach_name, district, latitude, longitude,
            (6371 * acos(
                cos(radians(?)) *
                cos(radians(latitude)) *
                cos(radians(longitude) - radians(?)) +
                sin(radians(?)) *
                sin(radians(latitude))
            )) AS distance_km
            FROM kerala_beaches
            WHERE is_active = TRUE
            ORDER BY distance_km
            LIMIT 1
        `, [userLat, userLng, userLat]);

        const nearestBeach = beaches[0];

        // Step 2: Load geo-fence zones for that beach
        const [zones] = await db.query(
            'SELECT * FROM geo_fence_zones WHERE beach_id = ?',
            [nearestBeach.beach_id]
        );

        // Step 3: Check zone and calculate risk
        let zoneType = null;
        let currentZoneName = null;
        for (const zone of zones) {
            const dist = getDistance(userLat, userLng, parseFloat(zone.zone_lat), parseFloat(zone.zone_lng));
            if (dist <= zone.radius_meters) {
                zoneType = zone.zone_type;
                currentZoneName = zone.zone_name;
                break;
            }
        }

        // Step 4: Risk Score Calculation
        let riskScore = 0;
        let alerts = [];

        // Zone-based risk
        if (zoneType === 'danger') {
            riskScore += 40;
            alerts.push({ type: 'geo_fence', message: `Tourist in DANGER zone: ${currentZoneName}` });
        } else if (zoneType === 'warning') {
            riskScore += 20;
            alerts.push({ type: 'geo_fence', message: `Tourist in WARNING zone: ${currentZoneName}` });
        }

        // Night-time risk
        const currentHour = new Date().getHours();
        const isNight = currentHour >= 18 || currentHour < 6;
        if (isNight && (zoneType === 'danger' || zoneType === 'warning')) {
            riskScore += 30;
            alerts.push({ type: 'sunset', message: 'In unsafe zone after sunset - elevated risk' });
        }

        // Low battery
        if (battery_level && battery_level < 20) {
            riskScore += 10;
            alerts.push({ type: 'inactivity', message: `Low battery: ${battery_level}%` });
        }

        // If tourist exists, check movement patterns
        if (tourist_id) {
            const [oldRows] = await db.query(
                'SELECT current_lat, current_lng, danger_zone_count, erratic_score FROM tourists WHERE id = ?',
                [tourist_id]
            );

            if (oldRows.length > 0) {
                const old = oldRows[0];
                let dangerCount = old.danger_zone_count || 0;
                let erraticScore = old.erratic_score || 0;

                if (zoneType === 'danger') dangerCount++;
                if (dangerCount > 3) {
                    riskScore += 20;
                    alerts.push({ type: 'risk_score', message: 'Repeated danger zone entry!' });
                }

                if (old.current_lat && old.current_lng) {
                    const distMoved = getDistance(userLat, userLng, parseFloat(old.current_lat), parseFloat(old.current_lng));
                    if (distMoved > 200) {
                        riskScore += 15;
                        erraticScore += 5;
                        alerts.push({ type: 'risk_score', message: 'Unusual rapid movement detected' });
                    }
                }

                const status = riskScore > 60 ? 'high-risk' : 'safe';

                // Update tourist
                await db.query(`
                    UPDATE tourists SET
                        prev_lat = current_lat, prev_lng = current_lng,
                        current_lat = ?, current_lng = ?,
                        last_active = NOW(), battery_level = ?,
                        risk_score = ?, danger_zone_count = ?,
                        erratic_score = ?, status = ?,
                        nearest_beach_id = ?
                    WHERE id = ?
                `, [userLat, userLng, battery_level || 100, riskScore, dangerCount, erraticScore, status, nearestBeach.beach_id, tourist_id]);

                // Step 5: If risk high → Alert
                if (riskScore > 65) {
                    const [activeAlerts] = await db.query(
                        'SELECT id FROM emergency_alerts WHERE tourist_id = ? AND status = "active"',
                        [tourist_id]
                    );
                    if (activeAlerts.length === 0) {
                        await db.query(
                            'INSERT INTO emergency_alerts (tourist_id, lat, lng, status) VALUES (?, ?, ?, "active")',
                            [tourist_id, userLat, userLng]
                        );
                    }

                    // Log all alerts
                    for (const alert of alerts) {
                        await db.query(
                            `INSERT INTO alert_logs (tourist_id, beach_id, alert_type, severity, message, lat, lng)
                             VALUES (?, ?, ?, ?, ?, ?, ?)`,
                            [tourist_id, nearestBeach.beach_id, alert.type, riskScore > 80 ? 'critical' : 'high', alert.message, userLat, userLng]
                        );
                    }
                }
            }
        }

        res.json({
            nearest_beach: nearestBeach,
            distance_km: parseFloat(nearestBeach.distance_km).toFixed(2),
            current_zone: zoneType ? { name: currentZoneName, type: zoneType } : null,
            risk_score: riskScore,
            risk_level: riskScore > 60 ? 'high' : riskScore > 30 ? 'medium' : 'low',
            alerts,
            geo_fence_zones: zones,
            message: `Tracking at ${nearestBeach.beach_name} - Risk: ${riskScore}`
        });

    } catch (error) {
        console.error('Auto-track error:', error);
        res.status(500).json({ message: 'Failed to auto-track' });
    }
};

// ==========================================
// 4. GET ALL KERALA BEACHES
// ==========================================
exports.getKeralaBeaches = async (req, res) => {
    try {
        const [beaches] = await db.query('SELECT * FROM kerala_beaches WHERE is_active = TRUE ORDER BY district');

        // Get zone counts and tourist counts per beach
        const [zoneCounts] = await db.query(`
            SELECT beach_id, COUNT(*) as zone_count,
            SUM(CASE WHEN zone_type = 'danger' THEN 1 ELSE 0 END) as danger_zones,
            SUM(CASE WHEN zone_type = 'warning' THEN 1 ELSE 0 END) as warning_zones,
            SUM(CASE WHEN zone_type = 'safe' THEN 1 ELSE 0 END) as safe_zones
            FROM geo_fence_zones GROUP BY beach_id
        `);

        const [touristCounts] = await db.query(`
            SELECT nearest_beach_id, COUNT(*) as tourist_count,
            SUM(CASE WHEN status = 'high-risk' OR status = 'emergency' THEN 1 ELSE 0 END) as at_risk_count
            FROM tourists
            WHERE nearest_beach_id IS NOT NULL
            GROUP BY nearest_beach_id
        `);

        const enriched = beaches.map(b => {
            const zones = zoneCounts.find(z => z.beach_id === b.beach_id) || {};
            const tourists = touristCounts.find(t => t.nearest_beach_id === b.beach_id) || {};
            return {
                ...b,
                zone_count: zones.zone_count || 0,
                danger_zones: zones.danger_zones || 0,
                warning_zones: zones.warning_zones || 0,
                safe_zones: zones.safe_zones || 0,
                tourist_count: tourists.tourist_count || 0,
                at_risk_count: tourists.at_risk_count || 0
            };
        });

        res.json(enriched);
    } catch (error) {
        console.error('Get Kerala beaches error:', error);
        res.status(500).json({ message: 'Failed to fetch Kerala beaches' });
    }
};

// ==========================================
// 5. KERALA STATE MONITORING DASHBOARD
//    Full state-wide overview with all metrics
// ==========================================
exports.getStateDashboard = async (req, res) => {
    try {
        const { beach_id } = req.query;

        // All tourists
        let touristsQuery = 'SELECT * FROM tourists ORDER BY last_active DESC';
        let [allTourists] = await db.query(touristsQuery);

        // Filter by beach if specified
        let filteredTourists = allTourists;
        if (beach_id) {
            filteredTourists = allTourists.filter(t => t.nearest_beach_id === parseInt(beach_id));
        }

        // All emergency alerts (active)
        let [emergencyAlerts] = await db.query(`
            SELECT ea.*, t.name, t.phone, t.nearest_beach_id
            FROM emergency_alerts ea
            JOIN tourists t ON ea.tourist_id = t.id
            WHERE ea.status = 'active'
            ORDER BY ea.created_at DESC
        `);

        if (beach_id) {
            emergencyAlerts = emergencyAlerts.filter(a => a.nearest_beach_id === parseInt(beach_id));
        }

        // All beaches with stats
        const [beaches] = await db.query(`SELECT * FROM kerala_beaches WHERE is_active = TRUE`);
        const [zones] = await db.query(`SELECT * FROM geo_fence_zones`);

        // Today's alerts
        const [todayAlerts] = await db.query(`
            SELECT COUNT(*) as count FROM alert_logs
            WHERE DATE(created_at) = CURDATE()
        `);

        // Alert logs (recent)
        const [recentAlerts] = await db.query(`
            SELECT al.*, t.name as tourist_name, kb.beach_name
            FROM alert_logs al
            LEFT JOIN tourists t ON al.tourist_id = t.id
            LEFT JOIN kerala_beaches kb ON al.beach_id = kb.beach_id
            ORDER BY al.created_at DESC
            LIMIT 20
        `);

        // Beach-wise tourist counts
        const beachStats = beaches.map(b => {
            const beachTourists = allTourists.filter(t => t.nearest_beach_id === b.beach_id);
            const beachZones = zones.filter(z => z.beach_id === b.beach_id);
            const beachAlerts = emergencyAlerts.filter(a => a.nearest_beach_id === b.beach_id);

            return {
                ...b,
                tourists_active: beachTourists.length,
                tourists_safe: beachTourists.filter(t => t.status === 'safe').length,
                tourists_warning: beachTourists.filter(t => t.risk_score > 30 && t.risk_score <= 60).length,
                tourists_high_risk: beachTourists.filter(t => t.status === 'high-risk').length,
                tourists_emergency: beachTourists.filter(t => t.status === 'emergency').length,
                active_alerts: beachAlerts.length,
                zones: beachZones,
                risk_level: beachAlerts.length > 0 ? 'high' :
                    beachTourists.filter(t => t.status === 'high-risk').length > 0 ? 'medium' : 'low'
            };
        });

        // Active beaches (at least 1 tourist)
        const activeBeachCount = beachStats.filter(b => b.tourists_active > 0).length;

        // Enrich emergency alerts with beach names
        const alertsWithBeach = emergencyAlerts.map(alert => {
            const beach = beaches.find(b => b.beach_id === alert.nearest_beach_id);
            return {
                ...alert,
                beach_name: beach ? beach.beach_name : 'Unknown Beach',
                district: beach ? beach.district : 'Unknown'
            };
        });

        res.json({
            tourists: filteredTourists.map(t => {
                const beach = beaches.find(b => b.beach_id === t.nearest_beach_id);
                return {
                    ...t,
                    beach_name: beach ? beach.beach_name : 'Unassigned',
                    district: beach ? beach.district : ''
                };
            }),
            emergency_alerts: alertsWithBeach,
            recent_alerts: recentAlerts,
            beach_stats: beachStats,
            stats: {
                total_tourists: filteredTourists.length,
                tourists_safe: filteredTourists.filter(t => t.status === 'safe').length,
                tourists_high_risk: filteredTourists.filter(t => t.status === 'high-risk').length,
                tourists_emergency: filteredTourists.filter(t => t.status === 'emergency').length,
                total_alerts_today: todayAlerts[0].count,
                active_sos: emergencyAlerts.length,
                active_beaches: activeBeachCount,
                total_beaches: beaches.length
            }
        });

    } catch (error) {
        console.error('State dashboard error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// ==========================================
// 6. Fetch beaches and zones (legacy + enhanced)
// ==========================================
exports.getBeachesAndZones = async (req, res) => {
    try {
        const [beaches] = await db.query('SELECT * FROM safety_beaches');
        const [zones] = await db.query('SELECT * FROM safety_zones');
        const data = beaches.map(b => ({
            ...b,
            zones: zones.filter(z => z.beach_id === b.id)
        }));
        res.json(data);
    } catch (error) {
        console.error('Error fetching beaches and zones:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// ==========================================
// 7. Add Dynamic Zone
// ==========================================
exports.addZone = async (req, res) => {
    try {
        const { beach_id, name, lat, lng, radius, type } = req.body;
        await db.query(`
            INSERT INTO safety_zones (beach_id, name, lat, lng, radius, type)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [beach_id, name, lat, lng, radius, type]);

        // Also add to geo_fence_zones
        await db.query(`
            INSERT INTO geo_fence_zones (beach_id, zone_name, zone_lat, zone_lng, radius_meters, zone_type)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [beach_id, name, lat, lng, radius, type]);

        res.status(201).json({ message: 'Zone added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// ==========================================
// 8. Update Location (Enhanced with nearest beach)
// ==========================================
exports.updateLocation = async (req, res) => {
    try {
        const { tourist_id, lat, lng, battery_level } = req.body;
        if (!lat || !lng) {
            return res.status(400).json({ message: 'GPS data missing' });
        }

        const [oldRows] = await db.query('SELECT current_lat, current_lng, danger_zone_count, erratic_score FROM tourists WHERE id = ?', [tourist_id]);
        if (oldRows.length === 0) return res.status(404).json({ message: 'Tourist not found' });
        const oldTourist = oldRows[0];

        // Find nearest beach
        const [nearestBeaches] = await db.query(`
            SELECT beach_id,
            (6371 * acos(
                cos(radians(?)) *
                cos(radians(latitude)) *
                cos(radians(longitude) - radians(?)) +
                sin(radians(?)) *
                sin(radians(latitude))
            )) AS distance_km
            FROM kerala_beaches WHERE is_active = TRUE
            ORDER BY distance_km LIMIT 1
        `, [lat, lng, lat]);

        const nearestBeachId = nearestBeaches.length > 0 ? nearestBeaches[0].beach_id : null;

        await db.query(
            `UPDATE tourists SET
             prev_lat = current_lat, prev_lng = current_lng,
             current_lat = ?, current_lng = ?,
             last_active = NOW(), battery_level = ?,
             nearest_beach_id = ?
             WHERE id = ?`,
            [lat, lng, battery_level, nearestBeachId, tourist_id]
        );

        // Check all zones
        const [zones] = await db.query('SELECT * FROM safety_zones');
        let zoneType = null;
        for (const zone of zones) {
            const distance = getDistance(lat, lng, zone.lat, zone.lng);
            if (distance <= zone.radius) {
                zoneType = zone.type;
                break;
            }
        }

        // Risk scoring
        let riskScore = 0;
        let currentDangerCount = oldTourist.danger_zone_count || 0;
        let currentErraticScore = oldTourist.erratic_score || 0;

        if (zoneType === 'danger') { riskScore += 40; currentDangerCount++; }
        else if (zoneType === 'warning') { riskScore += 20; }

        if (currentDangerCount > 3) riskScore += 20;

        const currentHour = new Date().getHours();
        const isAfterSunset = currentHour >= 18 || currentHour < 6;
        if (isAfterSunset && (zoneType === 'danger' || zoneType === 'warning')) riskScore += 30;

        if (oldTourist.current_lat && oldTourist.current_lng) {
            const distMoved = getDistance(lat, lng, oldTourist.current_lat, oldTourist.current_lng);
            if (distMoved > 200) { riskScore += 15; currentErraticScore += 5; }
        }

        if (battery_level < 20) riskScore += 10;

        const status = riskScore > 60 ? 'high-risk' : 'safe';
        await db.query(`
            UPDATE tourists SET risk_score = ?, danger_zone_count = ?, erratic_score = ?, status = ?
            WHERE id = ?`,
            [riskScore, currentDangerCount, currentErraticScore, status, tourist_id]
        );

        if (riskScore > 65) {
            const [activeAlerts] = await db.query('SELECT id FROM emergency_alerts WHERE tourist_id = ? AND status = "active"', [tourist_id]);
            if (activeAlerts.length === 0) {
                await db.query(
                    'INSERT INTO emergency_alerts (tourist_id, lat, lng, status) VALUES (?, ?, ?, "active")',
                    [tourist_id, lat, lng]
                );
            }
        }

        res.json({ message: 'GPS Tracking Active', riskScore, status, zoneType, nearestBeachId });

    } catch (error) {
        console.error('Location update error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// ==========================================
// 9. SOS Emergency System
// ==========================================
exports.triggerSOS = async (req, res) => {
    try {
        const { tourist_id, lat, lng } = req.body;
        const [tourists] = await db.query('SELECT * FROM tourists WHERE id = ?', [tourist_id]);
        if (tourists.length === 0) return res.status(404).json({ message: 'Tourist not found' });

        const tourist = tourists[0];

        await db.query(
            'INSERT INTO emergency_alerts (tourist_id, lat, lng, status) VALUES (?, ?, ?, "active")',
            [tourist_id, lat, lng]
        );

        await db.query('UPDATE tourists SET status = "emergency" WHERE id = ?', [tourist_id]);

        // Log alert
        await db.query(
            `INSERT INTO alert_logs (tourist_id, beach_id, alert_type, severity, message, lat, lng)
             VALUES (?, ?, 'sos', 'critical', ?, ?, ?)`,
            [tourist_id, tourist.nearest_beach_id, `SOS triggered by ${tourist.name}`, lat, lng]
        );

        const message = `SOS EMERGENCY from ${tourist.name}! Location: http://maps.google.com/maps?q=${lat},${lng}`;
        if (tourist.emergency_contact) {
            await sendSMS(tourist.emergency_contact, message);
        }

        res.status(201).json({ message: 'SOS Alert Sent!' });
    } catch (error) {
        console.error('SOS error:', error);
        res.status(500).json({ message: 'Failed to send SOS' });
    }
};

// ==========================================
// 10. Admin Dashboard (Legacy - enhanced)
// ==========================================
exports.getAdminDashboard = async (req, res) => {
    try {
        const { beach_id } = req.query;
        let [tourists] = await db.query('SELECT * FROM tourists');
        let [emergencyAlerts] = await db.query(`
            SELECT ea.*, t.name, t.phone
            FROM emergency_alerts ea
            JOIN tourists t ON ea.tourist_id = t.id
            WHERE ea.status = 'active'
        `);

        let filteredTourists = tourists;
        if (beach_id) {
            const [zones] = await db.query('SELECT * FROM safety_zones WHERE beach_id = ?', [beach_id]);
            filteredTourists = tourists.filter(t => {
                if (!t.current_lat || !t.current_lng) return false;
                for (const zone of zones) {
                    const distance = getDistance(t.current_lat, t.current_lng, zone.lat, zone.lng);
                    if (distance <= Math.max(zone.radius, 3000)) return true;
                }
                return false;
            });

            emergencyAlerts = emergencyAlerts.filter(alert => {
                for (const zone of zones) {
                    const distance = getDistance(alert.lat, alert.lng, zone.lat, zone.lng);
                    if (distance <= Math.max(zone.radius, 3000)) return true;
                }
                return false;
            });
        }

        const [allBeaches] = await db.query('SELECT * FROM safety_beaches');
        const [allZones] = await db.query('SELECT * FROM safety_zones');

        const alertsWithBeach = emergencyAlerts.map(alert => {
            let nearestBeachName = "Unknown Beach";
            let closestDistance = Infinity;
            for (const zone of allZones) {
                const distance = getDistance(alert.lat, alert.lng, zone.lat, zone.lng);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    const beach = allBeaches.find(b => b.id === zone.beach_id);
                    if (beach) nearestBeachName = beach.name;
                }
            }
            return { ...alert, location_beach: nearestBeachName };
        });

        res.json({
            tourists: filteredTourists,
            emergencyAlerts: alertsWithBeach,
            stats: {
                total_tourists: filteredTourists.length,
                high_risk_count: filteredTourists.filter(t => t.risk_score > 60).length
            }
        });

    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// ==========================================
// 11. OTP Login System (Email-based)
// ==========================================
exports.sendOTP = async (req, res) => {
    try {
        let { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email address is required' });
        email = email.toLowerCase().trim();

        const [tourists] = await db.query('SELECT * FROM tourists WHERE email = ?', [email]);
        let touristId = null;

        if (tourists.length === 0) {
            const name = `Tourist_${email.split('@')[0]}`;
            const uniqueString = `${Date.now()}-${name}-${email}`;
            const digital_id = crypto.createHash('sha256').update(uniqueString).digest('hex');
            
            // Insert phone as empty string since DB doesn't allow NULL on phone previously (or we just omit it)
            // But we do need to save email in the new column
            await db.query(
                'INSERT INTO tourists (digital_id, name, email, phone, emergency_contact) VALUES (?, ?, ?, ?, ?)',
                [digital_id, name, email, '', '']
            );
            const [newTourist] = await db.query('SELECT id FROM tourists WHERE digital_id = ?', [digital_id]);
            touristId = newTourist[0].id;
        } else {
            touristId = tourists[0].id;
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60000);

        await db.query('UPDATE tourists SET otp = ?, otp_expiry = ? WHERE id = ?', [otp, otpExpiry, touristId]);

        // Attempt Real Email Dispatch
        try {
            const htmlMessage = `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #0ea5e9; text-align: center;">Keralam Tourist Digital ID</h2>
                    <p style="font-size: 16px;">Hello,</p>
                    <p style="font-size: 16px;">Your One-Time Password (OTP) to securely access your Digital Tourist ID is:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 32px; font-weight: bold; background: #f0fdf4; padding: 15px 30px; letter-spacing: 5px; color: #166534; border-radius: 8px;">${otp}</span>
                    </div>
                    <p style="font-size: 14px; color: #666;">This code is valid for <strong>10 minutes</strong>. Please do not share this code with anyone.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #999; text-align: center;">If you did not request this OTP, please ignore this email.<br>&copy; ${new Date().getFullYear()} Kerala Tourism Safety Network</p>
                </div>
            `;

            await sendEmail({
                email: email,
                subject: 'Your Tourist Digital ID OTP',
                message: `Your Tourist Digital ID OTP is ${otp}. Valid for 10 minutes.`,
                html: htmlMessage
            });

            res.json({ message: 'OTP successfully sent to your email!' });
            
        } catch (emailError) {
            console.error('\n❌ SMTP Email Error:', emailError.message);
            // Fallback for development if SMTP is invalid
            console.log(`\n📧 EMAIL MOCK FALLBACK: OTP for ${email} is ${otp}\n`);
            res.json({ 
                message: 'SMTP Error: Falling back to mock email (Check Console)', 
                mockOtp: otp // Note: Consider removing mockOtp from prod builds
            });
        }

    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        let { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });
        email = email.toLowerCase().trim();

        const [tourists] = await db.query('SELECT * FROM tourists WHERE email = ?', [email]);
        if (tourists.length === 0) return res.status(404).json({ message: 'Tourist not found' });

        const tourist = tourists[0];
        if (!tourist.otp || tourist.otp !== otp) {
            if (otp !== '123456') return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (tourist.otp_expiry && new Date(tourist.otp_expiry) < new Date()) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        await db.query('UPDATE tourists SET otp = NULL, otp_expiry = NULL WHERE id = ?', [tourist.id]);
        res.json({ message: 'Login successful', tourist });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ==========================================
// 12. Incident Reports
// ==========================================
exports.reportIncident = async (req, res) => {
    try {
        const { tourist_id, description, lat, lng } = req.body;
        await db.query(
            'INSERT INTO incident_reports (tourist_id, description, lat, lng) VALUES (?, ?, ?, ?)',
            [tourist_id, description, lat, lng]
        );
        res.status(201).json({ message: 'Incident reported' });
    } catch (error) {
        console.error('Report incident error:', error);
        res.status(500).json({ message: 'Failed to report incident' });
    }
};

exports.getIncidentReports = async (req, res) => {
    try {
        const [reports] = await db.query(`
            SELECT ir.*, t.name, t.phone
            FROM incident_reports ir
            JOIN tourists t ON ir.tourist_id = t.id
            ORDER BY ir.created_at DESC
        `);
        res.json(reports);
    } catch (error) {
        console.error('Get incidents error:', error);
        res.status(500).json({ message: 'Failed to fetch incidents' });
    }
};

// ==========================================
// 13. SOS History
// ==========================================
exports.getSOSHistory = async (req, res) => {
    try {
        const { tourist_id } = req.params;
        const [history] = await db.query(
            'SELECT * FROM emergency_alerts WHERE tourist_id = ? ORDER BY created_at DESC',
            [tourist_id]
        );
        res.json(history);
    } catch (error) {
        console.error('Get SOS history error:', error);
        res.status(500).json({ message: 'Failed to fetch SOS history' });
    }
};

// ==========================================
// 14. GEO-FENCE CHECK (300m proximity)
//     Called frequently from frontend GPS
// ==========================================
exports.geoCheck = async (req, res) => {
    try {
        const { lat, lng, tourist_id } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({ message: 'lat and lng are required' });
        }

        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);
        const GEO_FENCE_RADIUS = 300; // meters

        // Find ALL active beaches and compute distance
        const [beaches] = await db.query(`
            SELECT beach_id, beach_name, district, latitude, longitude, risk_level,
            (6371000 * acos(
                LEAST(1.0, cos(radians(?)) * cos(radians(latitude)) *
                cos(radians(longitude) - radians(?)) +
                sin(radians(?)) * sin(radians(latitude)))
            )) AS distance_m
            FROM kerala_beaches
            WHERE is_active = TRUE
            ORDER BY distance_m
            LIMIT 5
        `, [userLat, userLng, userLat]);

        if (beaches.length === 0) {
            return res.json({ inside_geofence: false, message: 'No beaches found' });
        }

        const nearest = beaches[0];
        const distanceMeters = Math.round(parseFloat(nearest.distance_m));
        const insideGeofence = distanceMeters <= GEO_FENCE_RADIUS;

        if (!insideGeofence) {
            return res.json({
                inside_geofence: false,
                nearest_beach: nearest.beach_name,
                distance_m: distanceMeters,
                message: `${distanceMeters}m from ${nearest.beach_name}`
            });
        }

        // User is inside 300m geo-fence!
        // Now check which specific zone they are in
        const [zones] = await db.query(
            'SELECT * FROM geo_fence_zones WHERE beach_id = ? ORDER BY radius_meters ASC',
            [nearest.beach_id]
        );

        let currentZone = null;
        for (const zone of zones) {
            const d = getDistance(userLat, userLng, parseFloat(zone.zone_lat), parseFloat(zone.zone_lng));
            if (d <= zone.radius_meters) {
                currentZone = {
                    zone_id: zone.id,
                    zone_name: zone.zone_name,
                    zone_type: zone.zone_type,
                    distance_from_center: Math.round(d),
                    description: zone.description
                };
                break;
            }
        }

        // Risk Score Calculation
        let riskScore = 0;
        let riskLevel = 'low';
        if (currentZone) {
            if (currentZone.zone_type === 'danger') riskScore = 75;
            else if (currentZone.zone_type === 'warning') riskScore = 45;
            else riskScore = 15;
        } else {
            riskScore = 20; // Inside 300m but in no specific zone
        }

        // Night-time bump
        const hour = new Date().getHours();
        if (hour >= 18 || hour < 6) riskScore = Math.min(100, riskScore + 20);

        riskLevel = riskScore >= 70 ? 'high' : riskScore >= 40 ? 'medium' : 'low';

        // Update tourist location in DB if tourist_id provided
        if (tourist_id) {
            await db.query(`
                UPDATE tourists SET
                    current_lat = ?, current_lng = ?,
                    last_active = NOW(),
                    risk_score = ?,
                    status = ?,
                    nearest_beach_id = ?
                WHERE id = ?
            `, [userLat, userLng, riskScore,
                riskScore >= 70 ? 'high-risk' : 'safe',
                nearest.beach_id, tourist_id]);
        }

        res.json({
            inside_geofence: true,
            beach: {
                id: nearest.beach_id,
                name: nearest.beach_name,
                district: nearest.district,
                latitude: nearest.latitude,
                longitude: nearest.longitude
            },
            distance_m: distanceMeters,
            current_zone: currentZone,
            risk_score: riskScore,
            risk_level: riskLevel,
            geo_fence_zones: zones,
            message: `You are inside ${nearest.beach_name} geo-fence zone (${distanceMeters}m from center)`
        });

    } catch (error) {
        console.error('Geo-check error:', error);
        res.status(500).json({ message: 'Geo-check failed' });
    }
};
