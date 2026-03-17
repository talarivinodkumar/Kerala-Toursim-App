import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { ShieldAlert, Map, Bell, Phone, History, Flag } from 'lucide-react';
import TouristMap from '../components/TouristMap';

const DigitalIDDashboard = () => {
    const navigate = useNavigate();
    const [tourist, setTourist] = useState(null);
    const [incidents, setIncidents] = useState([]);
    const [sosHistory, setSosHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('map'); // map, incidents, history
    const [newIncident, setNewIncident] = useState('');
    const [riskStatus, setRiskStatus] = useState({ zoneType: 'safe', status: 'safe', riskScore: 0 });

    useEffect(() => {
        const stored = localStorage.getItem('digital_id_user');
        if (!stored) {
            navigate('/digital-id-login');
        } else {
            const parsed = JSON.parse(stored);
            setTourist(parsed);
            fetchIncidents();
            fetchSOSHistory(parsed.id);
        }
    }, [navigate]);

    const fetchIncidents = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/safety/incident');
            // Filter only pending/active incidents if desired, or all for dashboard.
            setIncidents(res.data);
        } catch (e) { console.error('Error fetching incidents'); }
    };

    const fetchSOSHistory = async (id) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/safety/sos-history/${id}`);
            setSosHistory(res.data);
        } catch (e) { console.error('Error fetching sos history'); }
    };

    const handleReportIncident = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/safety/incident', {
                tourist_id: tourist.id,
                description: newIncident,
                lat: localStorage.getItem('last_lat') || 10.1416, // using default or stored
                lng: localStorage.getItem('last_lng') || 76.1783
            });
            toast.success('Incident reported successfully!');
            setNewIncident('');
            fetchIncidents();
        } catch (e) {
            toast.error('Failed to report incident');
        }
    }

    const triggerSOS = async () => {
        if (window.confirm('Are you sure you want to trigger SOS? This will alert Rescue Teams and Emergency Contacts immediately!')) {
            try {
                await axios.post('http://localhost:5000/api/safety/sos', {
                    tourist_id: tourist.id,
                    lat: tourist.current_lat || 10.1416,
                    lng: tourist.current_lng || 76.1783
                });
                toast.error('SOS EMERGENCY ALERT SENT SUCCESSFULLY. RESCUE TEAMS DISPATCHED!');
                fetchSOSHistory(tourist.id);
            } catch (e) {
                toast.error('Failed to trigger SOS');
            }
        }
    };

    if (!tourist) return null;

    return (
        <div className="min-h-screen bg-[#0B132B] text-white p-6 font-sans">
            <ToastContainer />

            {/* Header / Digital ID Banner */}
            <header className="max-w-6xl mx-auto mb-8 bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500 opacity-20 blur-[100px] rounded-full mix-blend-screen mix-blend-screen pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-white pb-2">
                            Welcome, {tourist.name}
                        </h1>
                        <p className="text-indigo-200">Email: {tourist.email || 'Not provided'}</p>
                        <p className="text-indigo-200">Emergency Contact: {tourist.emergency_contact || 'None'}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center shadow-inner backdrop-blur-lg min-w-[300px]">
                        <div className="flex-1">
                            <p className="text-xs text-indigo-300 uppercase tracking-widest mb-1">Digital ID (SHA256)</p>
                            <p className="font-mono text-cyan-400 text-sm break-all">{tourist.digital_id}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Areas */}
            <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Navigation and Quick Actions */}
                <div className="space-y-6">
                    {/* SOS Action Hub */}
                    <div className="bg-red-950/40 border border-red-500/30 p-6 rounded-3xl relative overflow-hidden group hover:border-red-500/60 transition-colors">
                        <div className="absolute inset-0 bg-red-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <h2 className="text-2xl font-bold text-red-400 flex items-center mb-4 relative z-10">
                            <ShieldAlert className="mr-2" size={28} /> Emergency Center
                        </h2>
                        <button
                            onClick={triggerSOS}
                            className="w-full relative z-10 bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 active:scale-95 text-white font-bold py-6 px-4 rounded-2xl shadow-xl shadow-red-900/50 transform transition-all border border-red-400/50 flex flex-col items-center justify-center gap-2 uppercase tracking-wider text-xl"
                        >
                            <Bell size={32} className="animate-pulse" />
                            Trigger SOS
                        </button>
                        <p className="text-xs text-red-200/60 mt-4 text-center relative z-10 font-medium">Sends instant SMS to Local Rescue Teams and your Emergency Contact</p>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-4 flex flex-col gap-2">
                        <button onClick={() => setActiveTab('map')} className={`flex items-center p-4 rounded-xl transition-all ${activeTab === 'map' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}>
                            <Map className="mr-3" size={20} /> Live Tracking & Zones
                        </button>
                        <button onClick={() => setActiveTab('incidents')} className={`flex items-center p-4 rounded-xl transition-all ${activeTab === 'incidents' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}>
                            <Flag className="mr-3" size={20} /> Incident Reports
                        </button>
                        <button onClick={() => setActiveTab('history')} className={`flex items-center p-4 rounded-xl transition-all ${activeTab === 'history' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}>
                            <History className="mr-3" size={20} /> SOS History
                        </button>
                        <button onClick={() => { localStorage.removeItem('digital_id_user'); navigate('/digital-id-login'); }} className={`flex items-center p-4 rounded-xl transition-all mt-4 hover:bg-red-500/10 text-red-400 border border-transparent hover:border-red-500/30`}>
                            Logout Digital ID
                        </button>
                    </div>
                </div>

                {/* Right Column - Dynamic Content View */}
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6 min-h-[600px]">

                    {activeTab === 'map' && (
                        <div className="h-full flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold flex items-center">
                                    <Map className="mr-2 text-cyan-400" /> Geo-Fence Tracking Map
                                </h2>
                                <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase border tracking-wider ${riskStatus.zoneType === 'danger' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                                        riskStatus.zoneType === 'warning' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                                            'bg-green-500/20 text-green-400 border-green-500/50'
                                    }`}>
                                    {riskStatus.status} (Zone: {riskStatus.zoneType})
                                </div>
                            </div>
                            <div className="flex-1 bg-black/50 rounded-2xl relative overflow-hidden group">
                                <TouristMap tourist={tourist} onZoneUpdate={(zone, stat, score) => setRiskStatus({ zoneType: zone, status: stat, riskScore: score })} />
                            </div>
                            <div className="mt-6 flex flex-wrap gap-4 text-sm bg-white/5 p-4 rounded-xl">
                                <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-green-500 mr-2 border border-white/20"></div> Safe Zone</div>
                                <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-yellow-500 mr-2 border border-white/20"></div> Warning Area</div>
                                <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-red-500 mr-2 border border-white/20"></div> Danger Drop-off / High Tide</div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'incidents' && (
                        <div className="h-full flex flex-col">
                            <h2 className="text-2xl font-bold flex items-center mb-6 border-b border-white/10 pb-4">
                                <Flag className="mr-2 text-cyan-400" /> Public Incident Board
                            </h2>
                            <form onSubmit={handleReportIncident} className="mb-8">
                                <textarea
                                    value={newIncident}
                                    onChange={(e) => setNewIncident(e.target.value)}
                                    placeholder="Describe an incident, lost item, or hazard..."
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all mb-4 min-h-[120px]"
                                    required
                                />
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-xl shadow-lg transition-transform active:scale-95"
                                    >
                                        Report to Authorities
                                    </button>
                                </div>
                            </form>
                            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                                {incidents.map((incident) => (
                                    <div key={incident.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl shadow flex items-start">
                                        <div className="bg-indigo-500/20 p-3 rounded-full mr-4 text-indigo-400">
                                            <Bell size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-medium mb-1">{incident.description}</p>
                                            <div className="flex gap-4 text-xs text-indigo-300">
                                                <span>Reported by: {incident.name || 'Anonymous Tourist'}</span>
                                                <span>•</span>
                                                <span>Status: <span className="text-yellow-400 font-bold uppercase">{incident.status}</span></span>
                                                <span>•</span>
                                                <span>{new Date(incident.created_at).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {incidents.length === 0 && <p className="text-indigo-200/50 text-center italic py-8">No recent incidents reported in this zone.</p>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="h-full">
                            <h2 className="text-2xl font-bold flex items-center mb-6 border-b border-white/10 pb-4">
                                <History className="mr-2 text-cyan-400" /> My SOS History
                            </h2>
                            <div className="space-y-4">
                                {sosHistory.map((alert) => (
                                    <div key={alert.id} className="bg-red-950/20 border border-red-500/20 p-5 rounded-2xl flex items-center justify-between">
                                        <div>
                                            <h4 className="font-bold text-red-400 mb-1 flex items-center"><Phone size={16} className="mr-2" /> Dispatch Triggered</h4>
                                            <p className="text-xs text-indigo-200 font-mono">Lat: {alert.lat} | Lng: {alert.lng}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${alert.status === 'active' ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-green-500/20 text-green-400 border border-green-500/50'}`}>
                                                {alert.status}
                                            </span>
                                            <p className="text-xs text-indigo-300">{new Date(alert.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                                {sosHistory.length === 0 && (
                                    <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                                        <ShieldAlert className="mx-auto text-green-400/50 mb-3" size={48} />
                                        <p className="text-indigo-200">No emergency alerts triggered from your digital ID.</p>
                                        <p className="text-xs text-green-400/70 mt-2 font-bold uppercase tracking-widest">Safety Record: Excellent</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default DigitalIDDashboard;
