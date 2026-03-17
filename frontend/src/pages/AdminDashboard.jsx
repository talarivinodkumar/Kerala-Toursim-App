import { useState, useEffect } from 'react';
import {
    LayoutDashboard, Hotel, Waves, Package, Settings, Info, Plus, Save,
    RefreshCcw, Star, DollarSign, Image, Edit3, Trash2, CheckCircle2, User, Clock, ShieldCheck,
    ShieldAlert, MapPin, Activity, Battery, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    getHotels, createHotel, createRoom,
    getActivities, createActivity,
    getPackages, createPackage,
    getLiveStats, updateLiveStats,
    getPlaces, updatePlace,
    getSafetyDashboard, getSafetyBeaches
} from '../services/api';
import TouristMap from '../components/TouristMap';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('safety');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [hotels, setHotels] = useState([]);
    const [activities, setActivities] = useState([]);
    const [packages, setPackages] = useState([]);
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const [beaches, setBeaches] = useState([]);
    const [selectedSafetyBeach, setSelectedSafetyBeach] = useState('');

    const [safetyData, setSafetyData] = useState({
        tourists: [],
        emergencyAlerts: [],
        stats: { total_tourists: 0, high_risk_count: 0 }
    });

    const [hotelForm, setHotelForm] = useState({ name: '', rating: 5, price_range: 'Luxury', images: '' });
    const [roomForm, setRoomForm] = useState({ hotel_id: '', room_type: '', price_per_night: '', capacity: 2, description: '', image: '' });
    const [activityForm, setActivityForm] = useState({ name: '', price: '', available_slots: 10, description: '', image: '' });
    const [packageForm, setPackageForm] = useState({ name: '', package_type: 'Premium', price: '', description: '', includes: '', image: '' });

    const [score, setScore] = useState(50);
    const [isManual, setIsManual] = useState(false);
    const [visitorCount, setVisitorCount] = useState(45);
    const [bestTime, setBestTime] = useState("4:00 PM - 6:30 PM");
    const [statusBadge, setStatusBadge] = useState("Safe for Swimming");

    const [selectedPlace, setSelectedPlace] = useState(null);
    const [placeName, setPlaceName] = useState('');
    const [placeDesc, setPlaceDesc] = useState('');

    useEffect(() => {
        fetchData();
        const safetyInterval = setInterval(fetchSafetyData, 5000);
        return () => clearInterval(safetyInterval);
    }, [selectedSafetyBeach]); // Refetch when beach filter changes

    const fetchSafetyData = async () => {
        try {
            const res = await getSafetyDashboard(selectedSafetyBeach);
            setSafetyData(res.data);

            // Fetch actual safety beaches from backend to populate dropdown
            const bRes = await getSafetyBeaches();
            setBeaches(bRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    
    const fetchData = async () => {
        setLoading(true);
        try {
            const [hRes, aRes, pkgRes, liveRes, pRes] = await Promise.all([
                getHotels(),
                getActivities(),
                getPackages(),
                getLiveStats(),
                getPlaces()
            ]);
            setHotels(hRes.data);
            setActivities(aRes.data);
            setPackages(pkgRes.data);
            setScore(liveRes.data.crowd.score);
            setIsManual(liveRes.data.crowd.isManual);
            setVisitorCount(liveRes.data.crowd.visitorCount || 45);
            setBestTime(liveRes.data.crowd.bestTime || "4:00 PM - 6:30 PM");
            setStatusBadge(liveRes.data.crowd.statusBadge || "Safe for Swimming");

            setPlaces(pRes.data);
            if (pRes.data.length > 0) {
                const cherai = pRes.data.find(p => p.name.includes('Cherai')) || pRes.data[0];
                setSelectedPlace(cherai);
                setPlaceName(cherai.name);
                setPlaceDesc(cherai.description);
            }
            await fetchSafetyData();
        } catch (err) {
            console.error(err);
            setMessage('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (msg) => {
        setMessage(msg);
        setTimeout(() => setMessage(''), 3000);
    };

    const handleCrowdUpdate = async () => {
        setLoading(true);
        try {
            await updateLiveStats({ score, manualOverride: isManual, visitorCount, bestTime, statusBadge });
            showToast('Live dynamics updated! 🎯');
        } catch (err) { showToast('Failed to sync live data ❌'); }
        finally { setLoading(false); }
    };

    const handleAddHotel = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const imagesArray = hotelForm.images.split(',').map(s => s.trim());
            await createHotel({ ...hotelForm, images: imagesArray });
            showToast('Hotel added successfully! ✅');
            setHotelForm({ name: '', rating: 5, price_range: 'Luxury', images: '' });
            fetchData();
        } catch (err) { showToast('Error adding hotel ❌'); }
        finally { setLoading(false); }
    };

    const handleAddRoom = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createRoom(roomForm);
            showToast('Room added successfully! ✅');
            setRoomForm({ hotel_id: '', room_type: '', price_per_night: '', capacity: 2, description: '', image: '' });
            fetchData();
        } catch (err) { showToast('Error adding room ❌'); }
        finally { setLoading(false); }
    };

    const handleAddActivity = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createActivity(activityForm);
            showToast('Activity added successfully! ✅');
            setActivityForm({ name: '', price: '', available_slots: 10, description: '', image: '' });
            fetchData();
        } catch (err) { showToast('Error adding activity ❌'); }
        finally { setLoading(false); }
    };

    const handleAddPackage = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createPackage(packageForm);
            showToast('Package added successfully! ✅');
            setPackageForm({ name: '', package_type: 'Premium', price: '', description: '', includes: '', image: '' });
            fetchData();
        } catch (err) { showToast('Error adding package ❌'); }
        finally { setLoading(false); }
    };

    const handlePlaceUpdate = async () => {
        if (!selectedPlace) return;
        setLoading(true);
        try {
            await updatePlace(selectedPlace.id, { name: placeName, description: placeDesc });
            showToast('Page content updated! 📝');
        } catch (err) { showToast('Failed to update place ❌'); }
        finally { setLoading(false); }
    };

    const TabButton = ({ id, icon: Icon, label }) => (
        <button
            onClick={() => { setActiveTab(id); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-sm transition-all ${activeTab === id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 lg:translate-x-2' : 'text-gray-400 hover:bg-gray-100'}`}
        >
            <Icon size={20} />
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
            {/* Mobile Header */}
            <div className="lg:hidden bg-white border-b border-gray-100 p-6 flex items-center justify-between sticky top-0 z-40">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <LayoutDashboard size={20} />
                    </div>
                    <h1 className="text-lg font-black text-blue-950 tracking-tighter">Kerala Admin</h1>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-3 bg-gray-50 rounded-xl text-blue-950 font-black hover:bg-gray-100"
                >
                    {isSidebarOpen ? 'CLOSE' : 'MENU'}
                </button>
            </div>

            {/* Sidebar */}
            <div className={`
                fixed inset-0 lg:relative lg:inset-auto z-50 lg:z-0
                w-full lg:w-80 bg-white border-r border-gray-100 p-8 flex flex-col gap-10
                transition-transform duration-300 transform
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="flex items-center gap-4 px-2 mb-4 lg:mb-0">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                        <LayoutDashboard size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-blue-950 leading-tight">Kerala Admin</h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Statewide Control</p>
                    </div>
                </div>

                <nav className="flex flex-col gap-2 overflow-y-auto max-h-[60vh] lg:max-h-none">
                    <TabButton id="safety" icon={ShieldAlert} label="Tourist Safety" />
                    <TabButton id="crowd" icon={RefreshCcw} label="Crowd Control" />
                    <TabButton id="hotels" icon={Hotel} label="Hotels & Rooms" />
                    <TabButton id="activities" icon={Waves} label="Activities" />
                    <TabButton id="packages" icon={Package} label="Travel Packages" />
                    <TabButton id="content" icon={Edit3} label="Page Content" />
                </nav>

                <div className="mt-auto bg-blue-50 p-6 rounded-3xl border border-blue-100 text-center">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">System Status</p>
                    <div className="flex items-center justify-center gap-2 text-blue-950 font-black text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        Database Online
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 lg:p-12 overflow-y-auto">
                <AnimatePresence mode="wait">
                    {/* Safety Dashboard */}
                    {activeTab === 'safety' && (
                        <motion.div key="safety" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
                                <div>
                                    <h2 className="text-4xl font-black text-blue-950 mb-2">Tourist Safety Monitor</h2>
                                    <p className="text-gray-500 font-medium">Real-time status of marked tourists and live alerts.</p>
                                </div>
                                <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
                                    <MapPin size={20} className="text-blue-600" />
                                    <select
                                        value={selectedSafetyBeach}
                                        onChange={(e) => setSelectedSafetyBeach(e.target.value)}
                                        className="bg-transparent font-bold outline-none text-blue-950 cursor-pointer"
                                    >
                                        <option value="">Kerala State (All Beaches)</option>
                                        {beaches.map(beach => (
                                            <option key={beach.id} value={beach.id}>{beach.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                                {/* Stats Cards */}
                                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50 flex items-center gap-6">
                                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                        <User size={32} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Trackers</p>
                                        <h3 className="text-4xl font-black text-blue-950">{safetyData.stats.total_tourists}</h3>
                                    </div>
                                </div>
                                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50 flex items-center gap-6">
                                    <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                                        <AlertTriangle size={32} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">High Risk Warnings</p>
                                        <h3 className="text-4xl font-black text-orange-600">{safetyData.stats.high_risk_count}</h3>
                                    </div>
                                </div>
                                <div className="bg-white p-8 rounded-3xl shadow-sm border border-red-100 flex items-center gap-6">
                                    <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center animate-pulse">
                                        <ShieldAlert size={32} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Active SOS Alerts</p>
                                        <h3 className="text-4xl font-black text-red-600">{safetyData.emergencyAlerts.length}</h3>
                                    </div>
                                </div>
                            </div>

                            {/* Added Beach Map Visualization */}
                            <div className="bg-white p-6 rounded-[3rem] shadow-lg border border-gray-50 mb-12">
                                <h3 className="text-2xl font-black text-blue-950 mb-6 flex items-center gap-3 italic px-4">
                                    <MapPin className="text-blue-600" /> State-Wide Safety Map Visualization
                                </h3>
                                {/* Give the map container a distinct background to ensure it stands out if loading */}
                                <div className="rounded-2xl overflow-hidden bg-gray-100">
                                    {/* the TouristMap component defaults to tracking a single tourist, but without passing one, it just renders zones. */}
                                    {/* I can pass null to ensure it just renders the beach visualization */}
                                    <TouristMap tourist={null} onZoneUpdate={() => { }} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                {/* Live Tracked Users — Dark Card */}
                                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 rounded-[2rem] shadow-2xl border border-slate-700/50 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-black text-white flex items-center gap-2 tracking-tight">
                                            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                                <MapPin size={16} className="text-blue-400" />
                                            </div>
                                            Live Tracked Users
                                        </h3>
                                        <span className="text-[10px] font-bold text-slate-400 bg-slate-700/50 px-3 py-1 rounded-full uppercase tracking-wider">
                                            {safetyData.tourists.length} Active
                                        </span>
                                    </div>
                                    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
                                        {safetyData.tourists.map(tourist => {
                                            const isEmergency = tourist.status === 'emergency';
                                            const isHighRisk = tourist.status === 'high-risk';
                                            const ringColor = isEmergency ? 'ring-red-500 shadow-red-500/30' : isHighRisk ? 'ring-orange-500 shadow-orange-500/30' : 'ring-emerald-500 shadow-emerald-500/30';
                                            const dotColor = isEmergency ? 'bg-red-500' : isHighRisk ? 'bg-orange-400' : 'bg-emerald-400';
                                            const statusLabel = isEmergency ? 'SOS' : isHighRisk ? 'RISK' : 'OK';
                                            const labelColor = isEmergency ? 'text-red-400 bg-red-500/10 border-red-500/30' : isHighRisk ? 'text-orange-400 bg-orange-500/10 border-orange-500/30' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
                                            return (
                                                <div key={tourist.id} className="bg-white/[0.04] hover:bg-white/[0.08] rounded-2xl p-4 flex items-center justify-between transition-all duration-200 border border-white/[0.05]">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-full ring-2 ${ringColor} shadow-lg flex items-center justify-center text-white text-sm font-black bg-slate-700`}>
                                                            {tourist.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-white text-sm leading-tight">{tourist.name}</h4>
                                                            <p className="text-[11px] text-slate-500 font-mono">{tourist.phone}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="hidden sm:flex flex-col items-end gap-1">
                                                            <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                                                                <Battery size={10} className={tourist.battery_level < 20 ? 'text-red-400' : 'text-emerald-400'} /> {tourist.battery_level}%
                                                            </span>
                                                            <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                                                                <Activity size={10} /> {tourist.risk_score}%
                                                            </span>
                                                        </div>
                                                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${labelColor}`}>
                                                            <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${dotColor} ${isEmergency ? 'animate-pulse' : ''}`}></span>
                                                            {statusLabel}
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        {safetyData.tourists.length === 0 && (
                                            <div className="text-center py-16">
                                                <User size={32} className="mx-auto text-slate-600 mb-3" />
                                                <p className="text-slate-500 font-medium text-sm">No tourists currently tracked</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Emergency Feed — Dark Glassmorphism */}
                                <div className="bg-gradient-to-br from-red-950/80 via-slate-900 to-slate-900 p-8 rounded-[2rem] shadow-2xl border border-red-900/30 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-black text-white flex items-center gap-2 tracking-tight">
                                            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center relative">
                                                <AlertTriangle size={16} className="text-red-400" />
                                                {safetyData.emergencyAlerts.length > 0 && (
                                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
                                                )}
                                            </div>
                                            Emergency Feed
                                        </h3>
                                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${safetyData.emergencyAlerts.length > 0 ? 'text-red-400 bg-red-500/10 border border-red-500/30 animate-pulse' : 'text-emerald-400 bg-emerald-500/10'}`}>
                                            {safetyData.emergencyAlerts.length > 0 ? `${safetyData.emergencyAlerts.length} ACTIVE` : 'ALL CLEAR'}
                                        </span>
                                    </div>
                                    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
                                        {safetyData.emergencyAlerts.map(alert => (
                                            <div key={alert.id} className="bg-white/[0.04] rounded-2xl p-5 border border-red-500/10 hover:border-red-500/30 transition-all relative overflow-hidden group">
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 to-red-600 group-hover:shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                                                <div className="pl-3">
                                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                                        <span className="bg-red-500/20 text-red-400 px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border border-red-500/20">SOS</span>
                                                        {alert.location_beach && (
                                                            <span className="bg-blue-500/10 text-blue-400 px-2.5 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-1 border border-blue-500/20">
                                                                <MapPin size={8} /> {alert.location_beach}
                                                            </span>
                                                        )}
                                                        <span className="text-[10px] text-slate-500 font-mono ml-auto">
                                                            {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h4 className="font-black text-white text-base">{alert.name}</h4>
                                                            <p className="text-xs text-slate-500 font-mono mt-1">{alert.phone}</p>
                                                        </div>
                                                        <div className="text-right hidden sm:block">
                                                            <p className="text-[10px] text-slate-500 font-mono">{parseFloat(alert.lat).toFixed(4)}°N</p>
                                                            <p className="text-[10px] text-slate-500 font-mono">{parseFloat(alert.lng).toFixed(4)}°E</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 pt-3 border-t border-white/5 flex justify-end">
                                                        <button className="bg-red-500 hover:bg-red-600 text-white px-5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors shadow-lg shadow-red-500/20">
                                                            Dispatch
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {safetyData.emergencyAlerts.length === 0 && (
                                            <div className="text-center py-16">
                                                <ShieldCheck className="mx-auto text-emerald-500/60 mb-3" size={36} />
                                                <p className="text-emerald-400/80 font-bold text-sm">No active SOS alerts</p>
                                                <p className="text-slate-600 text-xs mt-1">All personnel are safe</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Crowd Control */}
                    {activeTab === 'crowd' && (
                        <motion.div key="crowd" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                            <div className="mb-12">
                                <h2 className="text-4xl font-black text-blue-950 mb-2">Live Dynamics</h2>
                                <p className="text-gray-500 font-medium">Control the real-time crowd indicators for public dashboards.</p>
                            </div>

                            <div className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-gray-50 max-w-4xl">
                                <div className="space-y-12">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
                                        <div>
                                            <div className="flex justify-between items-end mb-6">
                                                <h3 className="text-lg font-black text-blue-950 uppercase tracking-widest">Crowd Density</h3>
                                                <span className="text-5xl font-black text-blue-600">{score}%</span>
                                            </div>
                                            <input
                                                type="range" min="0" max="100" value={score}
                                                onChange={(e) => setScore(e.target.value)}
                                                className="w-full h-4 bg-gray-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Approx. Visitor Count</label>
                                            <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-3xl">
                                                <User className="text-blue-600" />
                                                <input
                                                    type="number" value={visitorCount} onChange={e => setVisitorCount(e.target.value)}
                                                    className="bg-transparent text-2xl font-black outline-none w-full"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Best Visit Time</label>
                                            <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-3xl">
                                                <Clock className="text-blue-600" />
                                                <input
                                                    value={bestTime} onChange={e => setBestTime(e.target.value)}
                                                    className="bg-transparent text-lg font-black outline-none w-full"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Live Safety Status</label>
                                            <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-3xl">
                                                <ShieldCheck className="text-green-500" />
                                                <input
                                                    value={statusBadge} onChange={e => setStatusBadge(e.target.value)}
                                                    className="bg-transparent text-lg font-black outline-none w-full"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleCrowdUpdate} disabled={loading}
                                        className="w-full bg-blue-950 text-white py-8 rounded-3xl font-black flex items-center justify-center gap-4 hover:bg-blue-800 transition-all active:scale-95 shadow-2xl shadow-blue-950/20"
                                    >
                                        <Save size={20} /> SYNC LIVE DYNAMICS
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Hotels & Rooms */}
                    {activeTab === 'hotels' && (
                        <motion.div key="hotels" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div className="bg-white p-10 rounded-[3rem] shadow-lg border border-gray-50">
                                    <h3 className="text-2xl font-black text-blue-950 mb-8 flex items-center gap-3 italic">
                                        <Hotel className="text-blue-600" /> New Property
                                    </h3>
                                    <form onSubmit={handleAddHotel} className="space-y-6">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Hotel Name</label>
                                            <input required value={hotelForm.name} onChange={e => setHotelForm({ ...hotelForm, name: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold border-transparent focus:bg-white focus:border-blue-500 outline-none" />
                                        </div>
                                        <div className="flex gap-6">
                                            <div className="flex-1">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Rating</label>
                                                <select value={hotelForm.rating} onChange={e => setHotelForm({ ...hotelForm, rating: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none">
                                                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Stars</option>)}
                                                </select>
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Price Tier</label>
                                                <select value={hotelForm.price_range} onChange={e => setHotelForm({ ...hotelForm, price_range: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none">
                                                    <option>Budget</option>
                                                    <option>Standard</option>
                                                    <option>Premium</option>
                                                    <option>Luxury</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Image URLs (comma separated)</label>
                                            <textarea value={hotelForm.images} onChange={e => setHotelForm({ ...hotelForm, images: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none h-24" />
                                        </div>
                                        <button className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black flex items-center justify-center gap-4 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">
                                            <Plus size={20} /> ADD HOTEL
                                        </button>
                                    </form>
                                </div>

                                <div className="bg-white p-10 rounded-[3rem] shadow-lg border border-gray-50">
                                    <h3 className="text-2xl font-black text-blue-950 mb-8 flex items-center gap-3 italic">
                                        <Plus className="text-blue-600" /> New Room Category
                                    </h3>
                                    <form onSubmit={handleAddRoom} className="space-y-6">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Parent Hotel</label>
                                            <select required value={roomForm.hotel_id} onChange={e => setRoomForm({ ...roomForm, hotel_id: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none">
                                                <option value="">Select Hotel</option>
                                                {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex gap-6">
                                            <div className="flex-1">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Room Type</label>
                                                <input required value={roomForm.room_type} onChange={e => setRoomForm({ ...roomForm, room_type: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none" />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Rate/Night</label>
                                                <input required type="number" value={roomForm.price_per_night} onChange={e => setRoomForm({ ...roomForm, price_per_night: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none" />
                                            </div>
                                        </div>
                                        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-50">
                                            <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-2">Room Description</label>
                                            <textarea required value={roomForm.description} onChange={e => setRoomForm({ ...roomForm, description: e.target.value })} className="w-full bg-transparent p-0 font-bold outline-none resize-none h-20" />
                                        </div>
                                        <button className="w-full bg-blue-950 text-white py-6 rounded-2xl font-black flex items-center justify-center gap-4 hover:bg-blue-800 transition-all shadow-xl shadow-blue-500/20">
                                            <Plus size={20} /> ADD ROOM
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Activities */}
                    {activeTab === 'activities' && (
                        <motion.div key="activities" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                            <div className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-gray-50 max-w-3xl">
                                <h3 className="text-3xl font-black text-blue-950 mb-10 italic flex items-center gap-4">
                                    <Waves className="text-blue-600" /> Signature Experience
                                </h3>
                                <form onSubmit={handleAddActivity} className="space-y-8">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Activity Name</label>
                                            <input required value={activityForm.name} onChange={e => setActivityForm({ ...activityForm, name: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none" placeholder="e.g. Sunset Boat Cruise" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Price per Guest</label>
                                            <input required type="number" value={activityForm.price} onChange={e => setActivityForm({ ...activityForm, price: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none" placeholder="1200" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Hero Image URL</label>
                                        <input required value={activityForm.image} onChange={e => setActivityForm({ ...activityForm, image: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none" placeholder="https://unsplash..." />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Experience Pitch</label>
                                        <textarea required value={activityForm.description} onChange={e => setActivityForm({ ...activityForm, description: e.target.value })} className="w-full bg-gray-50 p-6 rounded-2xl font-bold outline-none h-32" />
                                    </div>
                                    <button className="w-full bg-blue-600 text-white py-8 rounded-3xl font-black text-xl flex items-center justify-center gap-6 hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/30">
                                        <CheckCircle2 size={24} /> LAUNCH EXPERIENCE
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    )}

                    {/* Packages */}
                    {activeTab === 'packages' && (
                        <motion.div key="packages" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                            <div className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-gray-50 max-w-4xl">
                                <h3 className="text-3xl font-black text-blue-950 mb-10 italic flex items-center gap-4">
                                    <Package className="text-pink-500" /> Curated Travel Deal
                                </h3>
                                <form onSubmit={handleAddPackage} className="space-y-8">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Package Name</label>
                                            <input required value={packageForm.name} onChange={e => setPackageForm({ ...packageForm, name: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Category</label>
                                            <select value={packageForm.package_type} onChange={e => setPackageForm({ ...packageForm, package_type: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none">
                                                <option>Premium</option>
                                                <option>Romantic</option>
                                                <option>Adventure</option>
                                                <option>Cultural</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Package Price</label>
                                            <input required type="number" value={packageForm.price} onChange={e => setPackageForm({ ...packageForm, price: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Included Features (comma separated)</label>
                                            <input value={packageForm.includes} onChange={e => setPackageForm({ ...packageForm, includes: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none" placeholder="3 Nights, Free Spa, Breakfast" />
                                        </div>
                                    </div>
                                    <div className="bg-pink-50/30 p-8 rounded-3xl border border-pink-100">
                                        <label className="text-[10px] font-black text-pink-400 uppercase tracking-widest block mb-4">Marketing Description</label>
                                        <textarea required value={packageForm.description} onChange={e => setPackageForm({ ...packageForm, description: e.target.value })} className="w-full bg-transparent font-bold outline-none h-24" />
                                    </div>
                                    <button className="w-full bg-blue-950 text-white py-8 rounded-3xl font-black text-xl flex items-center justify-center gap-6 hover:bg-blue-800 transition-all shadow-2xl">
                                        <Save size={24} /> PUBLISH PACKAGE
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    )}

                    {/* Content Editor */}
                    {activeTab === 'content' && (
                        <motion.div key="content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                            <div className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-gray-50 max-w-4xl">
                                <h2 className="text-3xl font-black text-blue-950 mb-10 flex items-center gap-4 italic uppercase">
                                    <Edit3 className="text-blue-600" /> Page Master Content
                                </h2>

                                <div className="space-y-10">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] block mb-4">Destination Name</label>
                                        <input
                                            value={placeName} onChange={(e) => setPlaceName(e.target.value)}
                                            className="w-full bg-gray-50 p-6 rounded-3xl text-2xl font-black text-blue-950 border-2 border-transparent focus:border-blue-500 transition-all outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] block mb-4">About Section Description</label>
                                        <textarea
                                            value={placeDesc} onChange={(e) => setPlaceDesc(e.target.value)}
                                            className="w-full bg-gray-50 p-8 rounded-[2.5rem] text-lg font-medium text-gray-600 h-64 border-2 border-transparent focus:border-blue-500 transition-all outline-none leading-relaxed"
                                        />
                                    </div>

                                    <button
                                        onClick={handlePlaceUpdate} disabled={loading}
                                        className="w-full bg-blue-600 text-white py-8 rounded-[2rem] font-black text-xl flex items-center justify-center gap-6 hover:bg-blue-700 transition-all active:scale-95 shadow-3xl shadow-blue-500/20"
                                    >
                                        <CheckCircle2 size={24} /> APPLY CONTENT UPDATES
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Notification Toast */}
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        className="fixed bottom-12 right-12 z-50"
                    >
                        <div className={`px-10 py-5 rounded-[2rem] font-black text-sm shadow-2xl flex items-center gap-4 ${message.includes('❌') ? 'bg-red-500 text-white' : 'bg-blue-950 text-white'}`}>
                            {message.includes('✅') || message.includes('🎯') ? <CheckCircle2 size={20} /> : <Info size={20} />}
                            {message}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
