import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import { useState, useEffect } from 'react';
import { getPlaces } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import LiveSection from '../components/LiveSection';
import { Calendar, CloudSun, Map as MapIcon, Compass, AlertCircle, ChevronRight } from 'lucide-react';

const Cherai = () => {
    const [place, setPlace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPlace = async () => {
            try {
                const { data } = await getPlaces();
                const cheraiData = data.find(p => p.name.includes('Cherai'));
                if (cheraiData) {
                    setPlace(cheraiData);
                }
            } catch (err) {
                console.error("Failed to fetch data", err);
                setError("Unable to connect to live services. Showing offline version.");
            } finally {
                setLoading(false);
            }
        };
        fetchPlace();
    }, []);

    const beachImages = [
        // Cherai Beach shoreline - Kerala coast
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        // Kerala backwaters with coconut palms
        "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
        // Arabian Sea coast Kerala - golden sand
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
        // Kerala beach sunset with fishing boats
        "https://images.unsplash.com/photo-1468413253725-0d5181091126?auto=format&fit=crop&w=800&q=80"
    ];

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-sunset-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="font-bold text-sunset-orange">Preparing your Cherai experience...</p>
            </div>
        </div>
    );

    return (
        <div className="pb-20 bg-gray-50">
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ y: -100 }}
                        animate={{ y: 0 }}
                        exit={{ y: -100 }}
                        className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-red-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-2xl flex items-center gap-2"
                    >
                        <AlertCircle size={16} />
                        {error}
                        <button onClick={() => setError(null)} className="ml-2 opacity-50 hover:opacity-100">×</button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative">
                <HeroSection
                    title={place?.name || "Cherai Beach"}
                    subtitle="Known as the Golden Beach of Kerala"
                    image="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
                />
            </div>

            <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-30 mb-20">
                <LiveSection />
            </div>

            <div className="max-w-7xl mx-auto px-4 py-20">
                <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="inline-flex items-center gap-2 text-sunset-orange font-bold uppercase tracking-wider mb-4">
                            <Compass size={20} />
                            <span>Destination Insight</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">Where the Ocean meets the Lagoon</h2>
                        <p className="text-xl text-gray-600 leading-relaxed mb-8">
                            Cherai is famously <span className="text-sunset-orange font-bold italic">Known as the Golden Beach of Kerala</span>. This unique narrow strip of land is one of the few places on earth where you can witness the Arabian Sea and the calm backwaters separated by just a few hundred meters.
                        </p>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <Calendar className="text-sunset-orange mb-3" size={24} />
                                <h4 className="font-bold mb-1 italic">Best Time</h4>
                                <p className="text-sm text-gray-500">October – March (Placid & Pleasant)</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <CloudSun className="text-blue-500 mb-3" size={24} />
                                <h4 className="font-bold mb-1">Climate</h4>
                                <p className="text-sm text-gray-500">Tropical (29°C - 34°C average)</p>
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-2 gap-4">
                        {beachImages.map((img, idx) => (
                            <motion.img
                                key={idx}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                src={img}
                                alt="Cherai View"
                                className="rounded-2xl shadow-lg hover:brightness-110 transition-all duration-300 h-56 w-full object-cover"
                            />
                        ))}
                    </div>
                </div>

                <div className="max-w-3xl mx-auto">
                    <div className="bg-deep-blue text-white p-8 rounded-3xl shadow-xl flex flex-col justify-center">
                        <h3 className="text-2xl font-bold mb-6 italic">Trip Wisdom 🌟</h3>
                        <ul className="space-y-6">
                            <li className="flex items-start gap-4">
                                <div className="bg-white/10 p-2 rounded-lg text-sunset-orange">🛶</div>
                                <div>
                                    <h4 className="font-bold">Avoid Crowds</h4>
                                    <p className="text-sm text-gray-400">Visit on weekdays for a truly private beach feel.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="bg-white/10 p-2 rounded-lg text-sunset-orange">👟</div>
                                <div>
                                    <h4 className="font-bold">Dress Light</h4>
                                    <p className="text-sm text-gray-400">It's warm and humid; linen or cotton clothes are best.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="bg-white/10 p-2 rounded-lg text-sunset-orange">🧴</div>
                                <div>
                                    <h4 className="font-bold">Stay Sun-Safe</h4>
                                    <p className="text-sm text-gray-400">A good sunscreen is your best friend here.</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cherai;
