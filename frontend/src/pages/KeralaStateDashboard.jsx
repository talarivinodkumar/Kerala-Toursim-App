import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Circle, Popup, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, AlertTriangle, Shield, MapPin, Activity, Waves,
    Battery, Phone, Clock, Eye, ChevronDown, Radio, Zap
} from 'lucide-react';
import { getStateDashboard, getKeralaBeaches } from '../services/api';

const createMarkerIcon = (color, size = 12, pulse = false) => new L.DivIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50%;border:2px solid white;box-shadow:0 0 8px ${color}80;${pulse ? 'animation:pulse 1.5s infinite;' : ''}"></div>`,
    iconSize: [size, size], iconAnchor: [size / 2, size / 2]
});

const beachIcon = (risk) => new L.DivIcon({
    className: '',
    html: `<div style="width:28px;height:28px;background:${risk === 'high' ? '#ef4444' : risk === 'medium' ? '#f59e0b' : '#10b981'};border-radius:50%;border:3px solid white;box-shadow:0 0 12px ${risk === 'high' ? '#ef444480' : risk === 'medium' ? '#f59e0b80' : '#10b98180'};display:flex;align-items:center;justify-content:center;font-size:14px;">🏖️</div>`,
    iconSize: [28, 28], iconAnchor: [14, 14]
});

const KeralaStateDashboard = () => {
    const [data, setData] = useState(null);
    const [beaches, setBeaches] = useState([]);
    const [selectedBeach, setSelectedBeach] = useState('');
    const [loading, setLoading] = useState(true);
    const [activePanel, setActivePanel] = useState('overview');

    const fetchData = useCallback(async () => {
        try {
            const [dashRes, beachRes] = await Promise.all([
                getStateDashboard(selectedBeach), getKeralaBeaches()
            ]);
            setData(dashRes.data);
            setBeaches(beachRes.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [selectedBeach]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [fetchData]);

    if (loading || !data) return (
        <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, border: '3px solid #3b82f6', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
                <p style={{ color: '#64748b', fontWeight: 700 }}>Loading Kerala Safety Network...</p>
            </div>
        </div>
    );

    const { stats, tourists, emergency_alerts, beach_stats, recent_alerts } = data;

    const statCards = [
        { label: 'Active Tourists', value: stats.total_tourists, icon: Users, color: '#3b82f6', bg: '#1e3a5f' },
        { label: 'Alerts Today', value: stats.total_alerts_today, icon: AlertTriangle, color: '#f59e0b', bg: '#4a3520' },
        { label: 'High Risk', value: stats.tourists_high_risk + stats.tourists_emergency, icon: Zap, color: '#ef4444', bg: '#4a1d1d' },
        { label: 'Active Beaches', value: stats.active_beaches + '/' + stats.total_beaches, icon: Waves, color: '#10b981', bg: '#1a3a2a' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a0e1a 0%,#111827 50%,#0f172a 100%)', color: '#e2e8f0', fontFamily: "'Inter',sans-serif" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.5)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .glass{background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.06)}
        .stat-card{transition:all .3s;cursor:pointer}.stat-card:hover{transform:translateY(-4px);box-shadow:0 20px 40px rgba(0,0,0,0.3)}
        .beach-row{transition:all .2s}.beach-row:hover{background:rgba(255,255,255,0.05)!important}
        .scroll-area::-webkit-scrollbar{width:4px}.scroll-area::-webkit-scrollbar-thumb{background:#334155;border-radius:4px}
        .leaflet-container{background:#0a0e1a!important}
        @media(min-width:768px){
          .stat-grid{grid-template-columns:repeat(4,1fr)!important;gap:16px!important}
          .map-panel-grid{grid-template-columns:1fr 400px!important}
        }
      `}</style>

            {/* Header */}
            <header style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(59,130,246,0.3)' }}>
                        <Shield size={22} color="white" />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, letterSpacing: '-0.5px', background: 'linear-gradient(135deg,#e2e8f0,#94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Kerala Beach Safety Command</h1>
                        <p style={{ margin: 0, fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2 }}>State-Wide Monitoring Dashboard</p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 12, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                        <div style={{ width: 8, height: 8, background: '#10b981', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>LIVE</span>
                    </div>
                    <select value={selectedBeach} onChange={e => setSelectedBeach(e.target.value)}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', padding: '10px 16px', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', outline: 'none', minWidth: 200 }}>
                        <option value="">🌊 All Kerala Beaches</option>
                        {beaches.map(b => <option key={b.beach_id} value={b.beach_id}>{b.beach_name} — {b.district}</option>)}
                    </select>
                </div>
            </header>

            <div style={{ padding: '16px', display: 'grid', gap: 20 }}>
                {/* Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}
                     className="stat-grid">
                    {statCards.map((s, i) => (
                        <div key={i} className="stat-card glass" style={{ padding: 24, borderRadius: 20, animation: `slideUp ${0.3 + i * 0.1}s ease` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                <div style={{ width: 44, height: 44, background: s.bg, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <s.icon size={22} color={s.color} />
                                </div>
                                <span style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 2 }}>Live</span>
                            </div>
                            <h3 style={{ margin: 0, fontSize: 36, fontWeight: 900, color: s.color, letterSpacing: '-1px' }}>{s.value}</h3>
                            <p style={{ margin: '4px 0 0', fontSize: 12, fontWeight: 600, color: '#64748b' }}>{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Map + Panels */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}
                     className="map-panel-grid">
                    {/* Kerala Map */}
                    <div className="glass" style={{ borderRadius: 24, overflow: 'hidden', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 1000, display: 'flex', gap: 8 }}>
                            <div style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)', padding: '8px 14px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, border: '1px solid rgba(255,255,255,0.1)' }}>
                                <Radio size={14} color="#ef4444" style={{ animation: 'pulse 1.5s infinite' }} />
                                <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>Kerala State Safety Map</span>
                            </div>
                        </div>
                        <div style={{ position: 'absolute', bottom: 16, left: 16, zIndex: 1000, display: 'flex', gap: 8 }}>
                            {[{ c: '#10b981', l: 'Safe' }, { c: '#f59e0b', l: 'Warning' }, { c: '#ef4444', l: 'Danger' }].map((z, i) => (
                                <div key={i} style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)', padding: '6px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: z.c }}></div>
                                    <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8' }}>{z.l}</span>
                                </div>
                            ))}
                        </div>
                        <MapContainer center={[10.35, 76.25]} zoom={7} minZoom={7}
                            maxBounds={[[7.5, 74], [13.5, 78]]} maxBoundsViscosity={1}
                            style={{ height: 400, width: '100%', zIndex: 1 }} attributionControl={false}>
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                            {/* Beach markers */}
                            {beach_stats.map(b => (
                                <Marker key={b.beach_id} position={[parseFloat(b.latitude), parseFloat(b.longitude)]} icon={beachIcon(b.risk_level)}>
                                    <Popup><div style={{ minWidth: 180 }}>
                                        <h4 style={{ margin: '0 0 4px', fontWeight: 800 }}>{b.beach_name}</h4>
                                        <p style={{ margin: '0 0 2px', fontSize: 12, color: '#64748b' }}>{b.district}</p>
                                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                            <span style={{ fontSize: 11, fontWeight: 600 }}>👤 {b.tourists_active} tourists</span>
                                            {b.active_alerts > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444' }}>🚨 {b.active_alerts} alerts</span>}
                                        </div>
                                    </div></Popup>
                                </Marker>
                            ))}
                            {/* Geo-fence zones */}
                            {beach_stats.flatMap(b => (b.zones || []).map(z => (
                                <Circle key={z.zone_id || z.id} center={[parseFloat(z.zone_lat || z.lat), parseFloat(z.zone_lng || z.lng)]}
                                    radius={z.radius_meters || z.radius}
                                    pathOptions={{ fillColor: z.zone_type === 'danger' ? '#ef4444' : z.zone_type === 'warning' ? '#f59e0b' : '#10b981', fillOpacity: 0.15, color: z.zone_type === 'danger' ? '#ef4444' : z.zone_type === 'warning' ? '#f59e0b' : '#10b981', weight: 1.5 }}>
                                    <Popup><b>{z.zone_name}</b><br /><span style={{ textTransform: 'uppercase', fontSize: 11 }}>{z.zone_type}</span></Popup>
                                </Circle>
                            )))}
                            {/* Tourist markers on map */}
                            {tourists.filter(t => t.current_lat && t.current_lng).map(t => (
                                <Marker key={t.id} position={[parseFloat(t.current_lat), parseFloat(t.current_lng)]}
                                    icon={createMarkerIcon(t.status === 'emergency' ? '#ef4444' : t.status === 'high-risk' ? '#f59e0b' : '#10b981', t.status === 'emergency' ? 16 : 10, t.status === 'emergency')}>
                                    <Popup><div>
                                        <h4 style={{ margin: '0 0 4px', fontWeight: 700 }}>{t.name}</h4>
                                        <p style={{ margin: 0, fontSize: 12 }}>Risk: {t.risk_score}% | {t.status}</p>
                                        <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>{t.beach_name || 'Unknown'}</p>
                                    </div></Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>

                    {/* Right Panel */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Tab Buttons */}
                        <div className="glass" style={{ borderRadius: 16, padding: 6, display: 'flex', gap: 4 }}>
                            {[{ id: 'overview', l: 'Overview' }, { id: 'alerts', l: '🚨 SOS' }, { id: 'beaches', l: '🏖️ Beaches' }].map(t => (
                                <button key={t.id} onClick={() => setActivePanel(t.id)}
                                    style={{
                                        flex: 1, padding: '10px 0', borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', transition: 'all .2s',
                                        background: activePanel === t.id ? 'linear-gradient(135deg,#3b82f6,#6366f1)' : 'transparent',
                                        color: activePanel === t.id ? 'white' : '#64748b'
                                    }}>
                                    {t.l}
                                </button>
                            ))}
                        </div>

                        {/* Panel Content */}
                        <div className="glass scroll-area" style={{ borderRadius: 20, padding: 20, flex: 1, overflowY: 'auto', maxHeight: 456 }}>
                            {activePanel === 'overview' && (
                                <div>
                                    <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Eye size={16} color="#3b82f6" />Live Tracked Tourists
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {tourists.map(t => {
                                            const isE = t.status === 'emergency', isH = t.status === 'high-risk';
                                            const dotC = isE ? '#ef4444' : isH ? '#f59e0b' : '#10b981';
                                            return (
                                                <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', transition: 'all .2s' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${dotC}20`, border: `2px solid ${dotC}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: dotC }}>
                                                            {t.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{t.name}</p>
                                                            <p style={{ margin: 0, fontSize: 10, color: '#64748b' }}>{t.beach_name || '—'}</p>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <span style={{ fontSize: 10, color: '#64748b', display: 'flex', alignItems: 'center', gap: 3 }}>
                                                            <Battery size={10} color={t.battery_level < 20 ? '#ef4444' : '#10b981'} />{t.battery_level}%
                                                        </span>
                                                        <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 9, fontWeight: 800, textTransform: 'uppercase', background: `${dotC}15`, color: dotC, border: `1px solid ${dotC}30` }}>
                                                            {isE ? 'SOS' : isH ? 'RISK' : 'OK'}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {tourists.length === 0 && <p style={{ textAlign: 'center', color: '#475569', fontSize: 13, padding: 32 }}>No tourists tracked</p>}
                                    </div>
                                </div>
                            )}

                            {activePanel === 'alerts' && (
                                <div>
                                    <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <AlertTriangle size={16} color="#ef4444" />Emergency Feed
                                        {emergency_alerts.length > 0 && <span style={{ fontSize: 10, background: '#ef444420', color: '#ef4444', padding: '2px 8px', borderRadius: 8, fontWeight: 700, animation: 'pulse 2s infinite' }}>{emergency_alerts.length} ACTIVE</span>}
                                    </h3>
                                    {emergency_alerts.map(a => (
                                        <div key={a.id} style={{ padding: 16, borderRadius: 14, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', marginBottom: 10, borderLeft: '3px solid #ef4444' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                                <span style={{ fontSize: 10, fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: 6 }}>SOS ALERT</span>
                                                <span style={{ fontSize: 10, color: '#64748b' }}>{new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#f87171' }}>{a.name}</h4>
                                            <p style={{ margin: 0, fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={10} />{a.beach_name || 'Unknown'} — {a.district || ''}</p>
                                            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                                                <button style={{ flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 10, fontWeight: 800, border: 'none', cursor: 'pointer', background: '#ef4444', color: 'white', textTransform: 'uppercase' }}>Dispatch Rescue</button>
                                                <button style={{ padding: '8px 12px', borderRadius: 8, fontSize: 10, fontWeight: 800, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', background: 'transparent', color: '#94a3b8' }}>📍 Locate</button>
                                            </div>
                                        </div>
                                    ))}
                                    {emergency_alerts.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: 40 }}>
                                            <Shield size={36} color="#10b981" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.5 }} />
                                            <p style={{ color: '#10b981', fontWeight: 700, fontSize: 14 }}>All Clear</p>
                                            <p style={{ color: '#475569', fontSize: 12 }}>No active SOS alerts</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activePanel === 'beaches' && (
                                <div>
                                    <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Waves size={16} color="#06b6d4" />Beach-wise Monitoring
                                    </h3>
                                    {beach_stats.map(b => {
                                        const rc = b.risk_level === 'high' ? '#ef4444' : b.risk_level === 'medium' ? '#f59e0b' : '#10b981';
                                        return (
                                            <div key={b.beach_id} className="beach-row" style={{ padding: 14, borderRadius: 14, marginBottom: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}
                                                onClick={() => setSelectedBeach(b.beach_id.toString())}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                                    <div>
                                                        <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>{b.beach_name}</h4>
                                                        <p style={{ margin: 0, fontSize: 10, color: '#64748b' }}>{b.district}</p>
                                                    </div>
                                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: rc, boxShadow: `0 0 8px ${rc}60` }}></div>
                                                </div>
                                                <div style={{ display: 'flex', gap: 12 }}>
                                                    <span style={{ fontSize: 10, color: '#64748b' }}>👤 {b.tourists_active} tourists</span>
                                                    <span style={{ fontSize: 10, color: '#10b981' }}>✅ {b.tourists_safe} safe</span>
                                                    {b.tourists_high_risk > 0 && <span style={{ fontSize: 10, color: '#f59e0b' }}>⚠️ {b.tourists_high_risk} risk</span>}
                                                    {b.tourists_emergency > 0 && <span style={{ fontSize: 10, color: '#ef4444' }}>🚨 {b.tourists_emergency} SOS</span>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Alert Logs */}
                <div className="glass" style={{ borderRadius: 20, padding: 24 }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Clock size={16} color="#8b5cf6" />Recent Alert Activity
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 10 }}>
                        {(recent_alerts || []).slice(0, 8).map((a, i) => (
                            <div key={i} style={{ padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.severity === 'critical' ? '#ef4444' : a.severity === 'high' ? '#f59e0b' : '#3b82f6', flexShrink: 0 }}></div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ margin: 0, fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.message || a.alert_type}</p>
                                    <p style={{ margin: 0, fontSize: 10, color: '#64748b' }}>{a.tourist_name} • {a.beach_name || '—'} • {new Date(a.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KeralaStateDashboard;
