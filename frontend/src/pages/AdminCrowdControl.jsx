import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Save, Shield, Settings2, RefreshCcw, AlertCircle, FileText } from 'lucide-react';
import { getLiveStats, updateLiveStats, getPlaces, updatePlace } from '../services/api';

const AdminCrowdControl = () => {
    // Crowd State
    const [stats, setStats] = useState(null);
    const [score, setScore] = useState(20);
    const [isManual, setIsManual] = useState(false);

    // Place State
    const [allPlaces, setAllPlaces] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [placeName, setPlaceName] = useState('');
    const [placeDesc, setPlaceDesc] = useState('');

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const fetchData = async () => {
        try {
            const [statsRes, placesRes] = await Promise.all([
                getLiveStats(),
                getPlaces()
            ]);

            // Crowd setup
            setStats(statsRes.data);
            setScore(statsRes.data.crowd.score);
            setIsManual(statsRes.data.crowd.isManual);

            // Places setup (find Cherai)
            setAllPlaces(placesRes.data);
            const cherai = placesRes.data.find(p => p.name.includes('Cherai')) || placesRes.data[0];
            if (cherai) {
                setSelectedPlace(cherai);
                setPlaceName(cherai.name);
                setPlaceDesc(cherai.description);
            }
        } catch (err) {
            console.error("Failed to fetch", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCrowdUpdate = async () => {
        setLoading(true);
        setMessage('');
        try {
            await updateLiveStats({ score, manualOverride: isManual });
            setMessage('Crowd stats updated! ✅');
            fetchData();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Failed to update crowd ❌');
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceUpdate = async () => {
        if (!selectedPlace) return;
        setLoading(true);
        setMessage('');
        try {
            await updatePlace(selectedPlace.id, { name: placeName, description: placeDesc });
            setMessage('Place content updated! ✅');
            fetchData();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Failed to update place ❌');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-4">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="bg-deep-blue p-8 rounded-[2.5rem] shadow-2xl text-white flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-sunset-orange/10 blur-[80px] rounded-full -mr-32 -mt-32" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-sunset-orange font-bold uppercase tracking-wider text-xs mb-1">
                            <Shield size={14} />
                            Master Admin Panel
                        </div>
                        <h1 className="text-4xl font-black">Control Center</h1>
                    </div>
                    <Settings2 className="opacity-20 relative z-10" size={64} />
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Crowd Control Column */}
                    <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 md:p-10">
                        <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                            <Users size={24} className="text-sunset-orange" />
                            Crowd Management
                        </h3>

                        <div className="space-y-8">
                            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-gray-500 font-medium">Internal Score</span>
                                    <span className="text-2xl font-black text-deep-blue">{stats?.crowd?.score}%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-sunset-orange transition-all duration-500"
                                        style={{ width: `${stats?.crowd?.score}%` }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="flex justify-between text-sm font-bold text-gray-700 mb-4">
                                        <span>Target Capacity</span>
                                        <span className="text-sunset-orange text-lg">{score}%</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={score}
                                        onChange={(e) => setScore(e.target.value)}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sunset-orange"
                                    />
                                </div>

                                <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-200">
                                    <div>
                                        <p className="font-bold text-gray-800">Manual Override</p>
                                        <p className="text-xs text-gray-500">Bypass auto-algorithm</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isManual}
                                            onChange={(e) => setIsManual(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sunset-orange"></div>
                                    </label>
                                </div>

                                <button
                                    onClick={handleCrowdUpdate}
                                    disabled={loading}
                                    className="w-full bg-deep-blue text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50 shadow-lg active:scale-[0.98]"
                                >
                                    {loading ? <RefreshCcw className="animate-spin" size={20} /> : <Save size={20} />}
                                    Sync Crowd Stats
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content Editor Column */}
                    <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 md:p-10">
                        <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                            <FileText size={24} className="text-blue-500" />
                            Page Content
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 italic">Destination Name</label>
                                <input
                                    type="text"
                                    value={placeName}
                                    onChange={(e) => setPlaceName(e.target.value)}
                                    className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Description / About</label>
                                <textarea
                                    rows="6"
                                    value={placeDesc}
                                    onChange={(e) => setPlaceDesc(e.target.value)}
                                    className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm leading-relaxed"
                                    placeholder="Describe the experience..."
                                />
                            </div>

                            <button
                                onClick={handlePlaceUpdate}
                                disabled={loading}
                                className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg active:scale-[0.98]"
                            >
                                {loading ? <RefreshCcw className="animate-spin" size={20} /> : <Save size={20} />}
                                Update Description
                            </button>

                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <AlertCircle className="text-gray-400 mt-0.5" size={16} />
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                                    Changes will reflect globally on the Cherai Experience page instantly.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Global Message Toast */}
                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-8 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2"
                        >
                            <Save size={18} />
                            {message}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminCrowdControl;
