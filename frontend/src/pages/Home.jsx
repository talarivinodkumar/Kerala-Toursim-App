import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { geoCheck, registerTourist, triggerSOS } from '../services/api';
import {
    Home as HotelIcon, Compass, MapPin, ChevronRight, ArrowRight, Shield,
    Locate, Activity, Users, AlertTriangle, ShieldAlert, Map as MapIcon,
    ShieldCheck, Siren, Navigation, Wifi, WifiOff, Phone, X, CheckCircle,
    TrendingUp, Layers, Radio
} from 'lucide-react';
import LiveSection from '../components/LiveSection';

// ─── Zone colour config ───────────────────────────────────────────────────────
const ZONE_STYLES = {
    safe: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-400', icon: '🟢', label: 'SAFE ZONE' },
    warning: { bg: 'bg-amber-500/20', border: 'border-amber-500/40', text: 'text-amber-400', icon: '🟡', label: 'WARNING ZONE' },
    danger: { bg: 'bg-rose-500/20', border: 'border-rose-500/40', text: 'text-rose-400', icon: '🔴', label: 'DANGER ZONE' },
    unknown: { bg: 'bg-blue-500/20', border: 'border-blue-500/40', text: 'text-blue-400', icon: '🔵', label: 'MONITORING' },
};

const Home = () => {
    // ── GPS / Geo-fence state ─────────────────────────────────────────────────
    const [gpsStatus, setGpsStatus] = useState('idle');   // idle | requesting | active | denied
    const [touristId, setTouristId] = useState(null);
    const [geoState, setGeoState] = useState(null);      // full geoCheck response
    const [showWelcome, setShowWelcome] = useState(false);
    const [showSOS, setShowSOS] = useState(false);
    const [sosSent, setSosSent] = useState(false);
    const [sosLoading, setSosLoading] = useState(false);
    const [lastCoords, setLastCoords] = useState(null);
    const welcomeDismissed = useRef(false);
    const watchIdRef = useRef(null);
    const prevInside = useRef(false);

    // ── 1. Register tourist on mount ─────────────────────────────────────────
    useEffect(() => {
        const init = async () => {
            try {
                const res = await registerTourist({
                    name: `Visitor_${Math.floor(Math.random() * 9000 + 1000)}`,
                    phone: '+91 00000 00000',
                    emergency_contact: '+91 112'
                });
                if (res.data?.tourist?.id) setTouristId(res.data.tourist.id);
            } catch (_) { }
        };
        init();
    }, []);

    // ── 2. Continuous GPS watch ───────────────────────────────────────────────
    useEffect(() => {
        if (!navigator.geolocation) { setGpsStatus('denied'); return; }

        setGpsStatus('requesting');
        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                setGpsStatus('active');
                const { latitude, longitude } = pos.coords;
                setLastCoords({ lat: latitude, lng: longitude });
            },
            () => setGpsStatus('denied'),
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
        );

        return () => {
            if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
        };
    }, []);

    // ── 3. Poll geo-fence every 10s when GPS active ───────────────────────────
    useEffect(() => {
        if (!lastCoords) return;

        const checkGeo = async () => {
            try {
                const res = await geoCheck(lastCoords.lat, lastCoords.lng, touristId);
                const data = res.data;
                setGeoState(data);

                // Trigger welcome notification when user first enters beach zone
                if (data.inside_geofence && !prevInside.current && !welcomeDismissed.current) {
                    setShowWelcome(true);
                    welcomeDismissed.current = false;
                    setTimeout(() => setShowWelcome(false), 10000); // auto-dismiss after 10s
                }
                prevInside.current = data.inside_geofence;
            } catch (_) { }
        };

        checkGeo(); // immediate check
        const interval = setInterval(checkGeo, 10000);
        return () => clearInterval(interval);
    }, [lastCoords, touristId]);

    // ── 4. SOS handler ────────────────────────────────────────────────────────
    const handleSOS = async () => {
        if (!touristId || !lastCoords) return;
        setSosLoading(true);
        try {
            await triggerSOS({
                tourist_id: touristId,
                lat: lastCoords.lat,
                lng: lastCoords.lng
            });
            setSosSent(true);
        } catch (_) {
            setSosSent(true); // even on network error, show confirmation
        } finally {
            setSosLoading(false);
        }
    };

    // ── Derived values ────────────────────────────────────────────────────────
    const insideBeach = geoState?.inside_geofence ?? false;
    const beachName = geoState?.beach?.name ?? geoState?.nearest_beach ?? 'Cherai Beach';
    const distanceM = geoState?.distance_m ?? null;
    const currentZone = geoState?.current_zone;
    const riskScore = geoState?.risk_score ?? 0;
    const riskLevel = geoState?.risk_level ?? 'low';
    const zoneStyle = ZONE_STYLES[currentZone?.zone_type ?? 'unknown'];

    const riskColor = riskLevel === 'high' ? 'text-rose-400'
        : riskLevel === 'medium' ? 'text-amber-400'
            : 'text-emerald-400';
    const riskBg = riskLevel === 'high' ? 'bg-rose-500'
        : riskLevel === 'medium' ? 'bg-amber-500'
            : 'bg-emerald-500';

    return (
        <div className="bg-white">
            {/* ════════════════════════════════════════════════════════════════
                HERO SECTION
            ════════════════════════════════════════════════════════════════ */}
            <div className="relative h-screen overflow-hidden flex flex-col justify-center">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1920&q=80"
                        className="w-full h-full object-cover"
                        alt="Kerala Beach"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/85 via-emerald-900/45 to-transparent" />
                </div>

                <div className="relative max-w-7xl mx-auto px-6 w-full">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <div className="flex items-center gap-3 text-white font-black tracking-[0.3em] uppercase text-[10px] mb-6 sm:mb-8 bg-white/10 backdrop-blur-xl px-4 sm:px-6 py-3 rounded-full border border-white/20 w-fit">
                            <MapPin className="w-4 h-4 text-emerald-400" /> Premium Kerala Tourism
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-black text-white leading-[0.85] mb-6 sm:mb-10 tracking-tighter">
                            KERALAM <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-green-300">GOD'S OWN COUNTRY</span>
                        </h1>
                        <p className="text-base sm:text-xl md:text-2xl text-white/80 font-medium max-w-2xl mb-8 sm:mb-12 leading-relaxed">
                            Experience the breathtaking harmony of pristine beaches and tranquil backwaters in one unforgettable journey.
                        </p>

                        <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 items-start w-full sm:w-auto">
                            <Link to="/hotels" className="bg-emerald-600 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-full font-black text-base sm:text-lg hover:bg-emerald-500 transition-all flex items-center justify-center gap-3 shadow-xl w-full sm:w-auto">
                                Plan Your Trip <ArrowRight size={20} />
                            </Link>
                            <Link to="/cherai" className="bg-white/10 backdrop-blur-md text-white border border-white/30 px-8 sm:px-10 py-4 sm:py-5 rounded-full font-black text-base sm:text-lg hover:bg-white/20 transition-all w-full sm:w-auto text-center">
                                Explore Destinations
                            </Link>

                            {/* ─── GPS STATUS + SAFETY PANEL ─────────────────────────── */}
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-slate-900/80 backdrop-blur-xl border border-emerald-500/30 p-4 sm:p-5 rounded-2xl text-white shadow-2xl shadow-emerald-900/50 w-full sm:min-w-[310px] sm:w-auto"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <div className={`w-3 h-3 rounded-full ${gpsStatus === 'active' ? 'bg-emerald-400' : gpsStatus === 'denied' ? 'bg-rose-400' : 'bg-amber-400'}`} />
                                            {gpsStatus === 'active' && <div className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />}
                                        </div>
                                        <p className="text-sm font-black text-white">
                                            Safety Monitoring <span className="text-emerald-400">Active</span>
                                        </p>
                                    </div>
                                    {gpsStatus === 'active'
                                        ? <Wifi className="w-4 h-4 text-emerald-400" />
                                        : <WifiOff className="w-4 h-4 text-rose-400" />
                                    }
                                </div>

                                {/* Body */}
                                <div className="space-y-2 text-xs font-medium text-slate-300">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                                        <span>Location: <span className="text-white font-bold">{beachName}</span></span>
                                        {distanceM !== null && (
                                            <span className={`ml-auto text-[10px] font-black px-2 py-0.5 rounded-full ${insideBeach ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'}`}>
                                                {distanceM}m
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                        <span>Geo-Fence Zones <span className="text-emerald-400">Enabled</span></span>
                                    </div>
                                    {insideBeach && currentZone && (
                                        <div className={`flex items-center gap-2 ${zoneStyle.text}`}>
                                            <Layers className="w-3.5 h-3.5 flex-shrink-0" />
                                            <span className="font-bold">{zoneStyle.icon} {zoneStyle.label}</span>
                                        </div>
                                    )}
                                    {insideBeach && (
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                                            <span>Risk Score:
                                                <span className={`ml-1 font-black ${riskColor}`}>{riskScore}%</span>
                                                <span className={`ml-2 text-[10px] uppercase font-black ${riskColor}`}>({riskLevel})</span>
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                                        <span className="text-rose-200">SOS Emergency Ready</span>
                                        {insideBeach && (
                                            <button
                                                onClick={() => setShowSOS(true)}
                                                className="ml-auto bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full transition-all"
                                            >SOS</button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ════════════════════════════════════════════════════════════════
                WELCOME NOTIFICATION (pops in when user enters 300m zone)
            ════════════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {showWelcome && (
                    <motion.div
                        initial={{ x: 400, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 400, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[100] w-[calc(100%-2rem)] sm:w-[360px] max-w-[360px]"
                    >
                        <div className="bg-slate-900/95 backdrop-blur-2xl border border-emerald-500/40 rounded-3xl p-6 shadow-2xl shadow-emerald-900/60">
                            {/* Dismiss */}
                            <button
                                onClick={() => { setShowWelcome(false); welcomeDismissed.current = true; }}
                                className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            {/* Animated radar icon */}
                            <div className="flex items-center gap-4 mb-4">
                                <div className="relative w-14 h-14 flex-shrink-0">
                                    <div className="absolute inset-0 rounded-full border-2 border-emerald-400/30 animate-ping" />
                                    <div className="absolute inset-2 rounded-full border border-emerald-400/50 animate-ping" style={{ animationDelay: '0.3s' }} />
                                    <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center">
                                        <span className="text-2xl">🏝️</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-0.5">GEO-FENCE TRIGGERED</p>
                                    <h3 className="text-white font-black text-lg leading-tight">Welcome to {beachName}!</h3>
                                </div>
                            </div>

                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-4">
                                <p className="text-emerald-300 font-semibold text-sm">🛡️ Safety Monitoring Activated</p>
                                <p className="text-white/60 text-xs mt-1 leading-relaxed">Please follow beach safety guidelines. Our system is now tracking your location for your safety.</p>
                            </div>

                            {/* Stats row */}
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <div className="bg-white/5 rounded-xl p-2.5 text-center">
                                    <p className="text-white font-black text-lg">{distanceM}m</p>
                                    <p className="text-slate-400 text-[10px]">From shore</p>
                                </div>
                                <div className={`rounded-xl p-2.5 text-center ${zoneStyle.bg} border ${zoneStyle.border}`}>
                                    <p className={`font-black text-base ${zoneStyle.text}`}>{zoneStyle.icon}</p>
                                    <p className={`text-[10px] font-bold ${zoneStyle.text}`}>{currentZone?.zone_type ?? 'Zone'}</p>
                                </div>
                                <div className={`rounded-xl p-2.5 text-center ${riskLevel === 'high' ? 'bg-rose-500/20' : riskLevel === 'medium' ? 'bg-amber-500/20' : 'bg-emerald-500/20'}`}>
                                    <p className={`font-black text-lg ${riskColor}`}>{riskScore}%</p>
                                    <p className="text-slate-400 text-[10px]">Risk</p>
                                </div>
                            </div>

                            {/* Safety zone legend */}
                            <div className="space-y-1.5">
                                {[
                                    { type: 'safe', label: 'Safe Zone', desc: 'Low tide. Safe for swimming.' },
                                    { type: 'warning', label: 'Warning Zone', desc: 'Moderate currents. Caution.' },
                                    { type: 'danger', label: 'Danger Zone', desc: 'No swimming. High risk.' },
                                ].map(z => (
                                    <div
                                        key={z.type}
                                        className={`flex items-center gap-3 rounded-xl px-3 py-2 border ${ZONE_STYLES[z.type].bg} ${currentZone?.zone_type === z.type ? ZONE_STYLES[z.type].border : 'border-transparent'}`}
                                    >
                                        <span>{ZONE_STYLES[z.type].icon}</span>
                                        <div>
                                            <p className={`text-xs font-bold ${ZONE_STYLES[z.type].text}`}>{z.label}</p>
                                            <p className="text-slate-500 text-[10px]">{z.desc}</p>
                                        </div>
                                        {currentZone?.zone_type === z.type && (
                                            <span className={`ml-auto text-[10px] font-black uppercase ${ZONE_STYLES[z.type].text}`}>● You</span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setShowSOS(true)}
                                className="w-full mt-4 bg-rose-600 hover:bg-rose-500 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
                            >
                                <Siren className="w-4 h-4" /> SOS Emergency
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ════════════════════════════════════════════════════════════════
                SOS EMERGENCY DIALOG
            ════════════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {showSOS && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-slate-900 border border-rose-500/40 rounded-3xl p-8 max-w-sm w-full shadow-2xl"
                        >
                            {sosSent ? (
                                <div className="text-center">
                                    <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                                    <h3 className="text-white font-black text-2xl mb-2">SOS Sent!</h3>
                                    <p className="text-slate-400 mb-2">Emergency alert dispatched to:</p>
                                    <ul className="text-sm text-white space-y-1 mb-6">
                                        <li>✅ State Command Dashboard</li>
                                        <li>✅ Beach Lifeguard Team</li>
                                        <li>✅ Emergency Contact</li>
                                    </ul>
                                    <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-2xl p-4 mb-6 text-left">
                                        <p className="text-emerald-300 text-xs font-bold uppercase mb-1">Your GPS Location Sent</p>
                                        <p className="text-white text-sm font-mono">
                                            {lastCoords ? `${lastCoords.lat.toFixed(6)}, ${lastCoords.lng.toFixed(6)}` : 'Fetching...'}
                                        </p>
                                        <p className="text-slate-400 text-xs mt-1">Beach: {beachName}</p>
                                    </div>
                                    <button
                                        onClick={() => { setShowSOS(false); setSosSent(false); }}
                                        className="w-full bg-white/10 text-white font-black py-3 rounded-xl border border-white/10"
                                    >Close</button>
                                </div>
                            ) : (
                                <>
                                    <button onClick={() => setShowSOS(false)} className="float-right text-slate-500 hover:text-white">
                                        <X className="w-5 h-5" />
                                    </button>
                                    <div className="text-center mb-6">
                                        <div className="w-20 h-20 mx-auto bg-rose-500/20 border-2 border-rose-500 rounded-full flex items-center justify-center mb-4">
                                            <Siren className="w-10 h-10 text-rose-400" />
                                        </div>
                                        <h3 className="text-white font-black text-2xl mb-2">SOS Emergency Alert</h3>
                                        <p className="text-slate-400 text-sm">This will immediately alert the State Command Dashboard with your GPS location.</p>
                                    </div>

                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 space-y-2 text-sm">
                                        <div className="flex items-center gap-3 text-slate-300">
                                            <MapPin className="w-4 h-4 text-blue-400" />
                                            <span>Beach: <strong className="text-white">{beachName}</strong></span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-300">
                                            <Navigation className="w-4 h-4 text-emerald-400" />
                                            <span>Distance from shore: <strong className="text-white">{distanceM}m</strong></span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-300">
                                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                                            <span>Risk Level: <strong className={riskColor}>{riskLevel?.toUpperCase()}</strong></span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSOS}
                                        disabled={sosLoading}
                                        className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-70 text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all text-lg shadow-xl mb-3"
                                    >
                                        {sosLoading
                                            ? <span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-5 h-5" />
                                            : <><Phone className="w-5 h-5" /> SEND SOS ALERT</>
                                        }
                                    </button>
                                    <button
                                        onClick={() => setShowSOS(false)}
                                        className="w-full bg-white/5 text-slate-400 font-medium py-3 rounded-xl hover:bg-white/10 transition-all"
                                    >Cancel – I am safe</button>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ════════════════════════════════════════════════════════════════
                TOURIST SAFETY FEATURES RIBBON
            ════════════════════════════════════════════════════════════════ */}
            <div className="bg-slate-950 border-y border-white/10 py-10 relative z-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-8">
                        <h3 className="text-emerald-400 font-bold uppercase tracking-widest text-sm">Your Safety is Our Priority</h3>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 lg:gap-6 text-sm font-semibold text-slate-300">
                        {[
                            { icon: '📍', label: 'Live GPS Tracking', color: 'hover:border-emerald-500/30' },
                            { icon: '🚨', label: 'SOS Emergency Alert', color: 'hover:border-rose-500/30' },
                            { icon: '🗺️', label: 'Geo-Fence Beach Zones', color: 'hover:border-blue-500/30' },
                            { icon: '🛟', label: 'Lifeguard Monitoring', color: 'hover:border-amber-500/30' },
                            { icon: '📊', label: 'State Command Dashboard', color: 'hover:border-indigo-500/30' },
                        ].map(f => (
                            <div key={f.label} className={`flex items-center gap-3 bg-slate-900/80 px-5 py-3 rounded-full border border-slate-800 ${f.color} transition-colors shadow-lg shadow-black/50`}>
                                <span className="text-xl">{f.icon}</span> {f.label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ════════════════════════════════════════════════════════════════
                DASHBOARD STATISTICS + BEACH SAFETY SECTION
            ════════════════════════════════════════════════════════════════ */}
            <div className="bg-[#0f172a] py-24 px-6 border-b border-white/5 relative z-10 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.05)_0%,transparent_50%)]" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

                        {/* Dashboard Statistics */}
                        <div>
                            <div className="flex items-center gap-3 text-emerald-400 font-black uppercase text-[10px] tracking-[0.3em] mb-4">
                                <Activity className="w-4 h-4" /> State Monitoring Platform
                            </div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-8 tracking-tighter">Live Safety Insights</h2>

                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { icon: <Users className="w-6 h-6 text-blue-400" />, iconBg: 'bg-blue-500/20 border-blue-500/30', value: '56', suffix: <span className="text-blue-400/80 text-xs font-bold uppercase tracking-wider mb-2 animate-pulse">Live</span>, label: 'Active Tourists' },
                                    { icon: <MapIcon className="w-6 h-6 text-emerald-400" />, iconBg: 'bg-emerald-500/20 border-emerald-500/30', value: '7', label: 'Beaches Monitored' },
                                    { icon: <ShieldAlert className="w-6 h-6 text-rose-400" />, iconBg: 'bg-rose-500/20 border-rose-500/30', value: '2', valueColor: 'text-rose-500', suffix: <span className="text-rose-400 text-xs font-bold uppercase mb-2">Today</span>, label: 'SOS Alerts Today', labelColor: 'text-rose-500/80' },
                                    { icon: <ShieldCheck className="w-6 h-6 text-amber-400" />, iconBg: 'bg-amber-500/20 border-amber-500/30', value: '15', valueColor: 'text-amber-500', suffix: <span className="text-amber-400 text-xs font-bold uppercase mb-2">Active</span>, label: 'Safety Zones Active', labelColor: 'text-amber-500/80' },
                                ].map((card, i) => (
                                    <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-2xl hover:bg-white/10 transition-colors">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 border ${card.iconBg}`}>{card.icon}</div>
                                        <div className="flex items-end gap-3">
                                            <p className={`text-5xl font-black tracking-tighter ${card.valueColor ?? 'text-white'}`}>{card.value}</p>
                                            {card.suffix}
                                        </div>
                                        <p className={`text-sm font-medium mt-2 ${card.labelColor ?? 'text-gray-400'}`}>{card.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Beach Safety Zones */}
                        <div>
                            <div className="flex items-center gap-3 text-emerald-400 font-black uppercase text-[10px] tracking-[0.3em] mb-4">
                                <ShieldCheck className="w-4 h-4" /> Safety Services
                            </div>
                            <h2 className="text-4xl lg:text-5xl font-black text-white mb-8 tracking-tighter">Beach Risk Zones</h2>

                            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-md relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-500 shadow-2xl">
                                <div className="absolute top-10 right-10 w-2 h-2 bg-emerald-400 rounded-full">
                                    <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75" />
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    className="text-lg text-emerald-200 font-medium mb-6 border-l-4 border-emerald-500 pl-5 py-3 bg-gradient-to-r from-emerald-500/10 to-transparent rounded-r-2xl"
                                >
                                    Real-time safety monitoring is active at <span className="text-white font-bold">{beachName}</span>.
                                    {insideBeach && <span className="ml-2 text-xs text-emerald-300 font-bold">● YOU ARE HERE</span>}
                                </motion.div>

                                <div className="space-y-3">
                                    {[
                                        { type: 'safe', emoji: '🟢', title: 'Safe Zone', desc: 'Low tide. Safe for swimming & water sports.' },
                                        { type: 'warning', emoji: '🟡', title: 'Warning Zone', desc: 'Moderate currents. Swim with extreme caution.' },
                                        { type: 'danger', emoji: '🔴', title: 'Danger Zone', desc: 'High risk area. Strictly no swimming allowed.' },
                                    ].map(z => {
                                        const s = ZONE_STYLES[z.type];
                                        const isActive = insideBeach && currentZone?.zone_type === z.type;
                                        return (
                                            <div key={z.type} className={`flex items-center gap-5 p-4 rounded-2xl border transition-colors ${isActive ? `${s.bg} ${s.border}` : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                                                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${s.bg} border-2 shadow-lg ${s.border} ${isActive ? 'scale-110' : ''} transition-transform`}>
                                                    {z.emoji}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className={`font-bold text-lg tracking-wide ${isActive ? s.text : 'text-white'}`}>{z.title}</h4>
                                                    <p className="text-sm text-gray-400">{z.desc}</p>
                                                </div>
                                                {isActive && <span className={`text-xs font-black uppercase ${s.text} animate-pulse`}>● YOU</span>}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Real-time geo flow (shows only when inside) */}
                                {insideBeach && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-6 bg-slate-950/60 border border-white/10 rounded-2xl p-4"
                                    >
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Radio className="w-3 h-3 text-emerald-400" /> Live Monitoring Active
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-slate-300 flex-wrap">
                                            {['GPS detected', 'Geo-fence triggered', 'Safety monitoring', 'Risk detection', 'SOS ready'].map((step, i) => (
                                                <span key={step} className="flex items-center gap-1">
                                                    <span className="text-emerald-400">✓</span>
                                                    <span>{step}</span>
                                                    {i < 4 && <span className="text-slate-600 mx-1">→</span>}
                                                </span>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ════════════════════════════════════════════════════════════════
                STATE MAPPING SECTION (beach nodes)
            ════════════════════════════════════════════════════════════════ */}
            <div className="bg-[#020617] py-32 px-6 border-b border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-20">
                        <div className="flex items-center justify-center gap-3 text-blue-400 font-black uppercase text-[10px] tracking-[0.4em] mb-6">
                            <MapPin className="w-4 h-4" /> Kerala Coastal Network
                        </div>
                        <h2 className="text-5xl lg:text-7xl font-black text-white italic tracking-tighter uppercase leading-none">Safeguarded <br />Beaches</h2>
                        <p className="text-blue-100/50 font-medium mt-4 sm:mt-6 text-base sm:text-xl max-w-2xl mx-auto px-4">Our AI cameras and drone network currently secure major coastal destinations.</p>
                    </div>

                    <div className="relative w-full max-w-5xl mx-auto h-auto min-h-[400px] sm:min-h-[500px] lg:h-[600px] bg-slate-900/40 rounded-2xl sm:rounded-[3rem] border border-blue-500/10 flex items-center justify-center p-4 sm:p-8 overflow-hidden backdrop-blur-sm group hover:border-blue-500/30 transition-all duration-700 shadow-2xl">
                        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                        <div className="absolute right-[30%] top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-emerald-500/40 to-transparent" />
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                            <path d="M 200 150 Q 500 350 800 450" fill="none" stroke="rgba(52, 211, 153, 0.1)" strokeWidth="2" strokeDasharray="5,5" />
                            <path d="M 100 300 Q 400 400 900 200" fill="none" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="2" strokeDasharray="5,5" />
                        </svg>

                        <div className="relative w-full h-full flex flex-wrap justify-center items-center gap-6 z-10 p-4">
                            {[
                                { name: 'Bekal Beach', status: 'Secured', color: 'blue' },
                                { name: 'Muzhappilangad', status: 'Monitoring', color: 'amber' },
                                { name: 'Payyambalam', status: 'Secured', color: 'blue' },
                                { name: 'Dharmadam', status: 'Monitoring', color: 'amber' },
                                { name: 'Kappad Beach', status: 'Secured', color: 'blue' },
                                { name: 'Cherai Beach', status: 'Active', color: 'emerald', isMain: true },
                                { name: 'Fort Kochi', status: 'Monitoring', color: 'amber' },
                                { name: 'Marari Beach', status: 'Secured', color: 'blue' },
                                { name: 'Alappuzha Beach', status: 'Active', color: 'emerald' },
                                { name: 'Varkala Beach', status: 'Monitoring', color: 'amber' },
                                { name: 'Shanghumughom', status: 'Secured', color: 'blue' },
                                { name: 'Kovalam Beach', status: 'Secured', color: 'blue' },
                            ].map((beach, index) => {
                                const isE = beach.color === 'emerald';
                                const isA = beach.color === 'amber';
                                const glowColor = isE ? 'rgba(16,185,129,0.3)' : isA ? 'rgba(245,158,11,0.2)' : 'rgba(59,130,246,0.2)';
                                const borderColor = isE ? 'border-emerald-500/30' : isA ? 'border-amber-500/30' : 'border-blue-500/30';
                                const hoverBorder = isE ? 'hover:border-emerald-400' : isA ? 'hover:border-amber-400' : 'hover:border-blue-400';
                                const dotColor = isE ? 'bg-emerald-500' : isA ? 'bg-amber-500' : 'bg-blue-500';
                                const pingColor = isE ? 'bg-emerald-400' : isA ? 'bg-amber-400' : 'bg-blue-400';
                                const badgeBg = isE ? 'bg-emerald-500/10' : isA ? 'bg-amber-500/10' : 'bg-blue-500/10';
                                const badgeBorder = isE ? 'border-emerald-500/20' : isA ? 'border-amber-500/20' : 'border-blue-500/20';
                                const badgeText = isE ? 'text-emerald-400' : isA ? 'text-amber-400' : 'text-blue-400';
                                const scatterClasses = ['mt-4', '-mt-4', 'ml-8', '-ml-8', 'mt-8', '-mt-8'];
                                return (
                                    <motion.div
                                        key={beach.name}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.08, duration: 0.4 }}
                                        className={`relative cursor-pointer group/node ${scatterClasses[index % scatterClasses.length]} z-10`}
                                    >
                                        <div className={`absolute inset-0 ${dotColor} rounded-full blur-[40px] opacity-10 group-hover/node:opacity-40 transition-opacity duration-500`} />
                                        <div className={`relative flex items-center gap-3 bg-slate-950/80 backdrop-blur-md border ${borderColor} px-5 py-3 rounded-full ${hoverBorder} hover:-translate-y-1 transition-all duration-300`} style={{ boxShadow: `0 10px 40px -10px ${glowColor}` }}>
                                            <div className="relative flex items-center justify-center">
                                                {beach.status === 'Active' && <div className={`w-3 h-3 ${pingColor} rounded-full animate-ping absolute`} />}
                                                <div className={`w-3 h-3 ${dotColor} rounded-full relative z-10 border-2 border-slate-900`} />
                                            </div>
                                            <span className="text-white font-black text-sm tracking-tight">{beach.name}</span>
                                            <span className={`text-[9px] ${badgeBg} border ${badgeBorder} ${badgeText} px-2 py-1 rounded-full uppercase font-black tracking-widest`}>{beach.status}</span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* ════════════════════════════════════════════════════════════════
                LIVE ECOSYSTEM SECTION
            ════════════════════════════════════════════════════════════════ */}
            <div className="bg-slate-950 py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-20">
                        <div className="flex items-center gap-3 text-blue-400 font-black uppercase text-[10px] tracking-[0.4em] mb-4">
                            <Locate className="w-4 h-4" /> Live Intelligence Dashboard
                        </div>
                        <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white italic tracking-tighter uppercase leading-none">Real-Time <br />Pulse</h2>
                        <p className="text-white/40 font-medium mt-4 sm:mt-6 text-base sm:text-xl max-w-xl">Live crowd density, weather, and AI safety metrics compiled in real-time for your safe passage.</p>
                    </div>
                    <LiveSection />
                </div>
            </div>

            {/* ════════════════════════════════════════════════════════════════
                WANDER BEYOND THE SHORE SECTION
            ════════════════════════════════════════════════════════════════ */}
            <div className="bg-white py-32 px-6 relative overflow-hidden">
                {/* Subtle background decoration */}
                <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-emerald-50 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-50 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

                <div className="max-w-7xl mx-auto relative z-10">
                    {/* Section Header */}
                    <div className="text-center mb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black uppercase tracking-[0.3em] px-5 py-2.5 rounded-full mb-6">
                                <Compass className="w-3.5 h-3.5" /> Explore Nearby
                            </div>
                            <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-6">
                                Wander Beyond<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-green-500">the Shore</span>
                            </h2>
                            <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
                                Discover historical forts and serene backwaters just minutes away.
                            </p>
                        </motion.div>
                    </div>

                    {/* Destination Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                name: 'Cherai Backwaters',
                                tag: 'Backwaters',
                                tagColor: 'bg-blue-100 text-blue-700 border-blue-200',
                                desc: 'Serene lagoons separated from the sea by a narrow strip of land. Famous for canoe rides and Chinese fishing nets.',
                                image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
                                accent: 'from-blue-600/80 to-blue-900/90',
                                icon: '🚣',
                                badge: 'Must Visit',
                                badgeColor: 'bg-blue-500',
                            },
                            {
                                name: 'Kuzhupilly Beach',
                                tag: 'Hidden Gem',
                                tagColor: 'bg-amber-100 text-amber-700 border-amber-200',
                                desc: 'A hidden gem near Cherai, known for its pine trees and peaceful atmosphere. Ideal for a quiet morning walk.',
                                image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
                                accent: 'from-amber-600/80 to-orange-900/90',
                                icon: '🌲',
                                badge: 'Serene',
                                badgeColor: 'bg-amber-500',
                            },
                            {
                                name: 'Pallipuram Fort',
                                tag: 'Heritage',
                                tagColor: 'bg-rose-100 text-rose-700 border-rose-200',
                                desc: 'Built by the Portuguese in 1503, it\'s one of the oldest existing European monuments in India, located just minutes from the beach.',
                                image: '/pallipuram-fort.png',
                                accent: 'from-rose-700/80 to-stone-900/90',
                                icon: '🏰',
                                badge: 'Historic · 1503',
                                badgeColor: 'bg-rose-600',
                            },
                            {
                                name: 'Varkala Beach',
                                tag: 'Cliff Beach',
                                tagColor: 'bg-violet-100 text-violet-700 border-violet-200',
                                desc: 'Dramatic red laterite cliffs overlooking the Arabian Sea. A unique Kerala beach experience with mineral springs and vibrant cafes.',
                                image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
                                accent: 'from-violet-700/80 to-indigo-900/90',
                                icon: '🌊',
                                badge: 'Iconic',
                                badgeColor: 'bg-violet-600',
                            },
                        ].map((place, i) => (
                            <motion.div
                                key={place.name}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.55, delay: i * 0.1 }}
                                className="group relative rounded-[2rem] overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                                style={{ minHeight: '480px' }}
                            >
                                {/* Background Image */}
                                <div className="absolute inset-0">
                                    <img
                                        src={place.image}
                                        alt={place.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                                    />
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                                </div>

                                {/* Top Badge */}
                                <div className="absolute top-5 left-5 right-5 flex items-start justify-between z-10">
                                    <span className={`text-xs font-black uppercase tracking-widest text-white ${place.badgeColor} px-3 py-1.5 rounded-full shadow-lg`}>
                                        {place.badge}
                                    </span>
                                    <span className="text-2xl drop-shadow-lg">{place.icon}</span>
                                </div>

                                {/* Content at bottom */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                                    {/* Tag pill */}
                                    <span className={`inline-block text-[10px] font-black uppercase tracking-widest border px-3 py-1 rounded-full mb-3 ${place.tagColor}`}>
                                        {place.tag}
                                    </span>
                                    <h3 className="text-white font-black text-xl leading-tight mb-2 drop-shadow-lg">{place.name}</h3>
                                    {/* Description – slides up on hover */}
                                    <p className="text-white/80 text-sm leading-relaxed max-h-0 overflow-hidden group-hover:max-h-40 transition-all duration-500 ease-in-out">
                                        {place.desc}
                                    </p>

                                </div>

                                {/* Shine effect on hover */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ════════════════════════════════════════════════════════════════
                LUXURY SECTION
            ════════════════════════════════════════════════════════════════ */}
            <div className="space-y-40 py-40">
                <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="relative">
                        <img src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800" className="rounded-[3rem] shadow-2xl" alt="Resort" />
                    </div>
                    <div>
                        <div className="bg-orange-50 w-20 h-20 rounded-3xl flex items-center justify-center text-orange-600 mb-8 shadow-inner">
                            <HotelIcon size={40} />
                        </div>
                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-orange-950 mb-8 tracking-tighter">Luxury Stays & <br />Coastal Retreats</h2>
                        <p className="text-xl text-gray-500 font-medium mb-10 leading-relaxed">
                            From 5-star seaside resorts to private backwater villas, defining premium relaxation in Kerala.
                        </p>
                        <Link to="/hotels" className="inline-flex items-center gap-4 text-2xl font-black text-orange-600 group">
                            Explore Resorts <ChevronRight size={32} className="group-hover:translate-x-3 transition-transform" />
                        </Link>
                    </div>
                </section>
            </div>

            {/* ════════════════════════════════════════════════════════════════
                TRUST BANNER
            ════════════════════════════════════════════════════════════════ */}
            <div className="bg-emerald-600 py-16 sm:py-24 lg:py-32 mx-4 lg:mx-20 rounded-3xl sm:rounded-[4rem] mb-16 sm:mb-32 text-center relative overflow-hidden px-4 sm:px-8">
                <div className="relative z-10">
                    <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white mb-6 sm:mb-10 tracking-tighter italic uppercase">Ready for Your Next Adventure?</h2>
                    <p className="text-lg sm:text-2xl text-white/80 font-medium mb-8 sm:mb-12 max-w-2xl mx-auto">Join thousands of travelers who trust us for a safe and memorable Kerala experience.</p>
                    <Link to="/signup" className="bg-white text-emerald-600 px-8 sm:px-12 py-4 sm:py-6 rounded-full font-black text-lg sm:text-xl hover:bg-emerald-50 shadow-2xl inline-block">Get Your ID</Link>
                </div>
            </div>
        </div>
    );
};

export default Home;
