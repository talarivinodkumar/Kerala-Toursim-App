import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ShieldAlert, Navigation } from 'lucide-react';
import { getKeralaBeaches } from '../services/api';

const Beaches = () => {
    const [beaches, setBeaches] = useState([]);
    const [loading, setLoading] = useState(true);

    const beachConfig = {
        'Bekal Beach': { image: 'https://images.unsplash.com/photo-1685682378565-1c8715fba532?auto=format&fit=crop&w=1200&q=80', status: 'Secured', color: 'blue' },
        'Muzhappilangad': { image: 'https://images.unsplash.com/premium_photo-1664635401818-3a171967ab89?auto=format&fit=crop&w=1200&q=80', status: 'Monitoring', color: 'emerald' },
        'Payyambalam': { image: 'https://images.unsplash.com/photo-1724333659097-22cbc8b77346?auto=format&fit=crop&w=1200&q=80', status: 'Secured', color: 'blue' },
        'Dharmadam': { image: 'https://images.unsplash.com/photo-1714832088101-fe98ca627955?auto=format&fit=crop&w=1200&q=80', status: 'Monitoring', color: 'emerald' },
        'Kappad Beach': { image: 'https://images.unsplash.com/photo-1718796764127-6cacd396545f?auto=format&fit=crop&w=1200&q=80', status: 'Secured', color: 'blue' },
        'Cherai Beach': { image: 'https://images.unsplash.com/photo-1720086301610-ad904557921f?auto=format&fit=crop&w=1200&q=80', status: 'Active', color: 'emerald' },
        'Fort Kochi': { image: 'https://images.unsplash.com/photo-1583558257444-cfba032b49ea?auto=format&fit=crop&w=1200&q=80', status: 'Monitoring', color: 'emerald' },
        'Marari Beach': { image: 'https://images.unsplash.com/photo-1639572600111-a6f53cb7653b?auto=format&fit=crop&w=1200&q=80', status: 'Secured', color: 'blue' },
        'Alappuzha Beach': { image: 'https://images.unsplash.com/photo-1768660185923-f3744cc6fa7a?auto=format&fit=crop&w=1200&q=80', status: 'Active', color: 'emerald' },
        'Varkala Beach': { image: 'https://images.unsplash.com/photo-1663002422178-369db7cc8509?auto=format&fit=crop&w=1200&q=80', status: 'Monitoring', color: 'emerald' },
        'Shanghumughom': { image: 'https://images.unsplash.com/photo-1587548577544-7d9b3b8e174d?auto=format&fit=crop&w=1200&q=80', status: 'Secured', color: 'blue' },
        'Kovalam Beach': { image: 'https://images.unsplash.com/photo-1701793035486-c6b4368aa842?auto=format&fit=crop&w=1200&q=80', status: 'Secured', color: 'blue' },
    };

    useEffect(() => {
        const fetchBeaches = async () => {
            try {
                const { data } = await getKeralaBeaches();
                setBeaches(data);
            } catch (error) {
                console.error("Failed to fetch beaches", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBeaches();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            {/* Header */}
            <div className="bg-[#0f172a] text-white pt-20 pb-20 px-6 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1)_0%,transparent_50%)] pointer-events-none" />
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <span className="bg-white/10 text-emerald-400 font-bold px-4 py-2 rounded-full border border-white/20 text-xs tracking-widest uppercase mb-4 inline-block">
                        Kerala Smart Tourism
                    </span>
                    <h1 className="text-5xl lg:text-7xl font-black mb-6 tracking-tight">
                        Kerala <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Beaches</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
                        Explore Kerala's stunning coastline, fully protected by our smart safety network for your peace of mind.
                    </p>
                </div>
            </div>

            {/* Content List */}
            <div className="max-w-7xl mx-auto px-6 mt-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {beaches.map((beach, index) => {
                        const matchName = Object.keys(beachConfig).find(b => beach.beach_name.includes(b));
                        const config = matchName ? beachConfig[matchName] : {
                            image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
                            status: beach.is_active ? 'Active Monitoring' : 'Temporarily Offline',
                            color: beach.is_active ? 'emerald' : 'amber'
                        };

                        const statusColors = {
                            emerald: 'text-emerald-500 bg-emerald-50 border-emerald-200',
                            blue: 'text-blue-500 bg-blue-50 border-blue-200',
                            amber: 'text-amber-500 bg-amber-50 border-amber-200',
                        };
                        const activeColor = statusColors[config.color] || statusColors.emerald;

                        const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(beach.beach_name + ', Kerala')}`;

                        return (
                            <motion.div
                                key={beach.beach_id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-[2rem] shadow-lg border border-slate-100 overflow-hidden hover:shadow-2xl transition-all group flex flex-col md:flex-row h-full"
                            >
                                <div className="md:w-2/5 relative overflow-hidden min-h-[250px] md:min-h-full bg-slate-200">
                                    <img
                                        src={config.image}
                                        alt={beach.beach_name}
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <div className={`text-xs font-black uppercase px-3 py-1.5 rounded-full shadow-lg border ${activeColor}`}>
                                            ● {config.status}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8 md:w-3/5 flex flex-col justify-center">
                                    <h3 className="text-2xl font-black text-slate-900 mb-2">{beach.beach_name}</h3>
                                    <p className="text-slate-500 text-sm font-medium mb-6 leading-relaxed">
                                        {beach.description || "A pristine coastline offering the perfect setting for a quiet holiday."}
                                    </p>

                                    <div className="flex gap-4 mb-6">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                            <Navigation size={14} className="text-blue-500" /> Live Safety Tracking
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                            <ShieldAlert size={14} className="text-rose-500" /> Emergency Support
                                        </div>
                                    </div>

                                    <div className="mt-auto flex flex-col xl:flex-row gap-3">
                                        {beach.beach_name.includes('Cherai') && (
                                            <Link
                                                to="/cherai"
                                                className="flex-1 bg-slate-900 text-white font-black py-3 px-4 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-md text-sm text-center"
                                            >
                                                <ShieldAlert size={16} /> Safety Highlights
                                            </Link>
                                        )}
                                        <a
                                            href={mapLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex-1 bg-emerald-500 text-white font-black py-3 px-4 rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 shadow-md text-sm text-center"
                                        >
                                            <MapPin size={16} /> Google Maps
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Beaches;
