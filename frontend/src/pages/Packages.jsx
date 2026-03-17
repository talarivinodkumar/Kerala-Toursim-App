import { useState, useEffect, useContext } from 'react';
import { Heart, Sparkles, Star, CheckCircle2, MapPin, ChevronRight, Bookmark } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';

const Packages = () => {
    const [packages, setPackages] = useState([]);
    const { user } = useContext(AppContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPackages = async () => {
            console.log('Fetching packages...');
            try {
                const { data } = await api.get('/packages');
                console.log('Packages received:', data);
                setPackages(data);
            } catch (error) {
                console.error('Error fetching packages:', error);
            }
        };
        fetchPackages();
    }, []);

    const handleBooking = async (pkg) => {
        if (!user) {
            alert('Please login to book a package!');
            navigate('/login');
            return;
        }

        try {
            const { data: bookingResult } = await api.post('/bookings', {
                user_id: user.id,
                booking_type: 'package',
                item_id: pkg.id,
                guests: 1,
                total_price: pkg.price
            });

            navigate('/payment', {
                state: {
                    bookingDetails: {
                        id: bookingResult.booking_id,
                        type: 'Travel Package',
                        itemName: pkg.name,
                        totalPrice: pkg.price,
                        guests: 1
                    }
                }
            });
        } catch (error) {
            console.error('Booking failed:', error);
            alert('Booking failed. Please try again.');
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'Romantic': return 'pink';
            case 'Adventure': return 'cyan';
            case 'Cultural': return 'amber';
            case 'Premium': return 'purple';
            case 'Basic': return 'blue';
            default: return 'blue';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-24 px-6 sm:px-12">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block px-6 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-6"
                    >
                        Handpicked Experiences
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl lg:text-8xl font-black text-blue-950 mb-8 tracking-tighter"
                    >
                        Exclusive Packages
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-500 max-w-2xl mx-auto font-medium text-xl leading-relaxed"
                    >
                        Discover the magic of Kerala with our all-in-one curated travel experiences, designed for groups, couples, and adventurers.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 gap-24">
                    {packages.length > 0 ? packages.map((pkg) => (
                        <motion.div
                            key={pkg.id}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-[4rem] shadow-[0_40px_100px_rgba(0,0,0,0.06)] overflow-hidden border border-gray-100 group"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-5 h-full">
                                <div className="lg:col-span-2 h-[400px] lg:h-auto overflow-hidden relative">
                                    <img
                                        src={pkg.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200' + pkg.id}
                                        alt={pkg.name}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-950/20 to-transparent"></div>
                                    <div className={`absolute top-8 left-8 p-4 px-6 rounded-[2rem] font-black text-xs flex items-center gap-3 shadow-2xl backdrop-blur-md bg-${getTypeColor(pkg.package_type)}-500 text-white`}>
                                        {pkg.package_type === 'Romantic' ? <Heart className="w-4 h-4 fill-white" /> : <Sparkles className="w-4 h-4" />}
                                        {pkg.package_type?.toUpperCase() || 'LUXURY PACKAGE'}
                                    </div>
                                    <div className="absolute bottom-8 left-8 flex items-center gap-3 bg-white/20 backdrop-blur-lg px-6 py-3 rounded-full text-white border border-white/30 text-xs font-black uppercase tracking-widest">
                                        <MapPin className="w-4 h-4" /> Cherai & Surroundings
                                    </div>
                                </div>

                                <div className="lg:col-span-3 p-12 lg:p-20 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-10">
                                            <h2 className="text-4xl lg:text-5xl font-black text-blue-950 leading-tight tracking-tighter">{pkg.name}</h2>
                                            <div className="flex items-center gap-2 text-yellow-500 bg-yellow-50 px-4 py-2 rounded-full">
                                                <Star className="w-4 h-4 fill-current" />
                                                <span className="font-black text-blue-950 text-sm">4.9</span>
                                            </div>
                                        </div>

                                        <p className="text-gray-500 text-lg font-medium mb-12 leading-relaxed italic border-l-4 border-blue-50 pl-8">{pkg.description}</p>

                                        <div className="mb-16">
                                            <p className="text-[10px] font-black text-gray-400 gap-2 flex items-center uppercase tracking-[0.2em] mb-8">
                                                <Bookmark className="w-4 h-4 text-blue-400" /> Premium Inclusions
                                            </p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                {(pkg.includes || '').split(',').map((item, id) => (
                                                    <div key={id} className="flex items-center gap-4 text-sm font-black text-blue-900 bg-gray-50/50 p-4 px-6 rounded-[1.5rem] border border-gray-100 transition-all hover:bg-white hover:shadow-lg">
                                                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                        {item.trim()}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-12 pt-12 border-t border-gray-50">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Package Price</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-5xl font-black text-blue-950 tracking-tighter">₹{pkg.price}</span>
                                                <span className="text-gray-400 font-bold text-sm">/ all-incl.</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleBooking(pkg)}
                                            className="px-12 py-6 rounded-[2.5rem] font-black text-2xl transition-all transform active:scale-95 shadow-[0_20px_50px_rgba(37,99,235,0.3)] flex items-center gap-4 group/btn bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-2 border-white/20"
                                        >
                                            Secure Trip <ChevronRight className="w-7 h-7 transition-transform group-hover/btn:translate-x-2" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )) : (
                        <div className="col-span-full text-center py-40 bg-white rounded-[5rem] shadow-xl border border-gray-100">
                            <Sparkles className="w-16 h-16 text-blue-200 mx-auto mb-8 animate-pulse" />
                            <h3 className="text-4xl font-black text-blue-950 mb-4">Curating Experiences...</h3>
                            <p className="text-gray-400 font-bold text-lg leading-relaxed">We're tailoring the perfect Cherai travel packages for you. <br />If they don't appear shortly, ensure the server is running!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Packages;
