const db = require('../config/db');

const getLiveStats = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM live_stats WHERE location = ?', ['cherai_beach']);

        let crowdScore = 20;
        let isManual = false;
        let visitorCount = 45;
        let bestTime = "4:00 PM - 6:30 PM";
        let statusBadge = "Safe for Swimming";

        if (rows.length > 0) {
            visitorCount = rows[0].visitor_count || 45;
            bestTime = rows[0].best_time || "4:00 PM - 6:30 PM";
            statusBadge = rows[0].status_badge || "Safe for Swimming";

            if (rows[0].manual_override) {
                crowdScore = rows[0].crowd_score;
                isManual = true;
            } else {
                const now = new Date();
                const hour = now.getHours();
                const day = now.getDay();
                crowdScore = 20;
                if (hour >= 16 && hour <= 19) crowdScore += 50;
                else if (hour >= 10 && hour <= 15) crowdScore += 30;
                if (day === 0 || day === 6) crowdScore += 20;
                crowdScore += Math.floor(Math.random() * 10) - 5;
            }
        }

        crowdScore = Math.max(0, Math.min(100, crowdScore));
        let status = crowdScore > 70 ? "Very Busy" : crowdScore > 40 ? "Moderate" : "Peaceful";

        // Get highlights
        const [highlights] = await db.query('SELECT message FROM live_highlights WHERE active = TRUE ORDER BY created_at DESC LIMIT 1');
        const highlight = highlights.length > 0 ? highlights[0].message : "Golden Hour starting soon! Perfect for a backwater cruise.";

        // Simulated Hourly Prediction (for the chart)
        const predictions = [15, 20, 45, 80, 75, 40, 25]; // 12pm, 2pm, 4pm, 6pm, 8pm, 10pm, 12am

        res.json({
            crowd: {
                score: crowdScore,
                status: status,
                isManual: isManual,
                description: `${status} crowd detected at Cherai.`,
                visitorCount: visitorCount,
                bestTime: bestTime,
                statusBadge: statusBadge,
                predictions: predictions
            },
            highlight: highlight,
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ message: "Error calculating live stats" });
    }
};

const updateLiveStats = async (req, res) => {
    const { score, manualOverride, visitorCount, bestTime, statusBadge } = req.body;
    try {
        await db.query(
            'UPDATE live_stats SET crowd_score = ?, manual_override = ?, visitor_count = ?, best_time = ?, status_badge = ? WHERE location = ?',
            [score, manualOverride, visitorCount, bestTime, statusBadge, 'cherai_beach']
        );
        res.json({ message: "Live stats updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to update stats" });
    }
};

module.exports = { getLiveStats, updateLiveStats };
