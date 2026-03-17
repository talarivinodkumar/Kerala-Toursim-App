import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Users, Clock, CloudSun, Sunset } from 'lucide-react';
import { getLiveStats } from '../services/api';
import { getWeather } from '../services/weatherService';

const LiveSection = () => {
    const [liveData, setLiveData] = useState(null);
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [stats, weatherInfo] = await Promise.all([
                    getLiveStats(),
                    getWeather()
                ]);
                setLiveData(stats.data);
                setWeather(weatherInfo);
            } catch (err) {
                console.error("Failed to fetch live data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 60000);
        const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);

        return () => {
            clearInterval(interval);
            clearInterval(clockInterval);
        };
    }, []);

    const formatTime = (timestamp) => {
        if (!timestamp) return '--:--';
        return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) return (
        <div className="flex justify-center py-20 bg-gray-50">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <section className="py-16 md:py-24 bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <span className="text-blue-600 font-bold tracking-wider text-sm uppercase flex items-center justify-center gap-2 mb-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        Live Updates
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                        Cherai <span className="text-blue-600">Right Now</span>
                    </h2>
                </div>

                {/* Info Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">

                    {/* Weather Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-3xl p-8 shadow-xl shadow-blue-500/5 border border-blue-100 flex flex-col justify-between hover:-translate-y-2 transition-transform duration-300"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-blue-50 rounded-2xl text-blue-500">
                                <CloudSun size={28} />
                            </div>
                            <span className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Climate</span>
                        </div>
                        <div>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-6xl font-black text-gray-900 leading-none">
                                    {Math.round(weather?.main?.temp || 29)}°
                                </span>
                                <span className="text-2xl font-bold text-gray-400 mb-1">C</span>
                            </div>
                            <p className="text-lg font-medium text-gray-600 capitalize">
                                {weather?.weather[0]?.description || 'Clear Sky'}
                            </p>
                        </div>
                    </motion.div>

                    {/* Crowd & Pulse Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="bg-indigo-600 rounded-3xl p-8 shadow-xl shadow-indigo-600/20 text-white flex flex-col justify-between hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden"
                    >
                        <div className="absolute -right-6 -top-6 text-white/10">
                            <Users size={120} />
                        </div>
                        <div className="relative z-10 flex justify-between items-start mb-6">
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                <Users size={28} className="text-white" />
                            </div>
                            <span className="text-sm font-semibold text-indigo-200 uppercase tracking-widest">Crowd Pulse</span>
                        </div>
                        <div className="relative z-10">
                            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white mb-4">
                                {liveData?.crowd?.statusBadge || "Optimal Conditions"}
                            </span>
                            <div className="flex items-end gap-3">
                                <p className="text-5xl font-black leading-none">
                                    {liveData?.crowd?.visitorCount || 45}
                                </p>
                                <p className="text-indigo-200 font-medium mb-1">Active Tourists</p>
                            </div>
                            <p className="mt-4 text-sm text-indigo-100 font-medium opacity-80">
                                Best time: {liveData?.crowd?.bestTime || "4:00 PM - 6:30 PM"}
                            </p>
                        </div>
                    </motion.div>

                    {/* Time & Sunset Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-3xl p-8 shadow-xl shadow-blue-500/5 border border-blue-100 flex flex-col justify-between hover:-translate-y-2 transition-transform duration-300"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-orange-50 rounded-2xl text-orange-500">
                                <Clock size={28} />
                            </div>
                            <span className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Time Sync</span>
                        </div>
                        <div>
                            <p className="text-4xl font-black text-gray-900 tracking-tight mb-4">
                                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <div className="flex items-center gap-3 text-orange-600 bg-orange-50 px-4 py-3 rounded-2xl w-max">
                                <Sunset size={20} />
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold uppercase tracking-wider opacity-60 line-clamp-1">Golden Hour</span>
                                    <span className="text-sm font-bold">{formatTime(weather?.sys?.sunset)}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default LiveSection;
