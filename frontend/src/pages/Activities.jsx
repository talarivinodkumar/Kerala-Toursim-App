import { useState, useEffect, useContext } from 'react';
import { Ship, Camera, Waves, Sun, Ticket, MapPin, ChevronRight, Clock, Shield, Anchor, Target } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';

const Activities = () => {
    const [activities, setActivities] = useState([]);
    const { user } = useContext(AppContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const { data } = await api.get('/activities');
                setActivities(data);
            } catch (error) {
                console.error('Error fetching activities:', error);
            }
        };
        fetchActivities();
    }, []);

    const handleBooking = async (activity) => {
        if (!user) {
            alert('Please login to book an activity!');
            navigate('/login');
            return;
        }

        try {
            const { data: bookingResult } = await api.post('/bookings', {
                user_id: user.id,
                booking_type: 'activity',
                item_id: activity.id,
                guests: 1,
                total_price: activity.price
            });

            navigate('/payment', {
                state: {
                    bookingDetails: {
                        id: bookingResult.booking_id,
                        type: 'Coastal Activity',
                        itemName: activity.name,
                        totalPrice: activity.price,
                        guests: 1
                    }
                }
            });
        } catch (error) {
            console.error('Booking failed:', error);
            alert('Booking failed. Please try again.');
        }
    };

    const getIcon = (name) => {
        if (name.includes('Boat')) return <Anchor className="w-8 h-8" />;
        if (name.includes('Photo')) return <Camera className="w-8 h-8" />;
        if (name.includes('Water')) return <Waves className="w-8 h-8" />;
        if (name.includes('Sun')) return <Sun className="w-8 h-8" />;
        return <Ticket className="w-8 h-8" />;
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Ultra-Luxury Header */}
            <div className="bg-white pt-20 sm:pt-32 lg:pt-40 pb-16 sm:pb-24 lg:pb-32 px-4 sm:px-6 relative overflow-hidden border-b border-gray-100">
                <div className="max-w-7xl mx-auto relative">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <div className="inline-flex items-center gap-4 bg-blue-50 text-blue-600 px-6 sm:px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-8 sm:mb-12 shadow-sm border border-blue-100">
                            Adventures in Cherai
                        </div>
                        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[10rem] font-black text-blue-950 mb-6 sm:mb-10 tracking-tighter leading-[0.85] uppercase">
                            Signature <br /> <span className="text-blue-600 outline-text">Experiences</span>
                        </h1>
                        <p className="text-lg sm:text-xl lg:text-2xl text-gray-500 font-medium max-w-3xl mx-auto leading-relaxed italic px-4">
                            Curated excursions designed for the discerning traveler. Discover the untamed beauty of the Malabar Coast.
                        </p>
                    </motion.div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
            </div>

            {/* Alternating Experiences Layout */}
            <div className="py-0">
                {activities.length > 0 ? activities.map((activity, idx) => (
                    <section
                        key={activity.id}
                        className={`py-16 sm:py-24 lg:py-32 border-b border-gray-50 last:border-0 ${idx % 2 !== 0 ? 'bg-blue-50/30' : 'bg-white'}`}
                    >
                        <div className="max-w-7xl mx-auto px-4 sm:px-6">
                            <div className={`flex flex-col ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-10 sm:gap-16 lg:gap-24`}>
                                {/* Image Collage Side */}
                                <motion.div
                                    initial={{ opacity: 0, x: idx % 2 !== 0 ? 50 : -50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="flex-1 relative group"
                                >
                                    <div className="relative h-[300px] sm:h-[450px] lg:h-[600px] w-full rounded-2xl sm:rounded-[4rem] overflow-hidden shadow-2xl">
                                        <img
                                            src={activity.image || 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200'}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                            alt={activity.name}
                                        />
                                        <div className="absolute inset-0 bg-blue-950/20 mix-blend-multiply group-hover:bg-transparent transition-all duration-700"></div>

                                        {/* Floating Badge */}
                                        <div className="absolute top-4 left-4 sm:top-12 sm:left-12 bg-white/95 backdrop-blur-md px-4 sm:px-8 py-2 sm:py-4 rounded-xl sm:rounded-[2rem] shadow-2xl border border-white/50 flex items-center gap-2 sm:gap-4">
                                            <div className="text-blue-600">{getIcon(activity.name)}</div>
                                            <div className="h-8 w-px bg-gray-100"></div>
                                            <span className="text-[10px] font-black text-blue-950 uppercase tracking-widest">Top Rated Activity</span>
                                        </div>
                                    </div>
                                    {/* Abstract Overlay */}
                                    <div className={`absolute -z-10 w-full h-full border-2 border-blue-200 rounded-[4rem] transition-transform duration-700 group-hover:rotate-3 ${idx % 2 !== 0 ? '-top-8 -left-8' : '-top-8 -right-8'}`}></div>
                                </motion.div>

                                {/* Content Side */}
                                <motion.div
                                    initial={{ opacity: 0, x: idx % 2 !== 0 ? -50 : 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="flex-1 text-left"
                                >
                                    <div className="flex items-center gap-4 mb-8">
                                        <span className="bg-blue-600 w-12 h-[2px]"></span>
                                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Signature Collection</span>
                                    </div>
                                    <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-blue-950 mb-6 sm:mb-8 tracking-tighter uppercase leading-none">
                                        {activity.name.split(' ').map((word, wIdx) => (
                                            <span key={wIdx} className={wIdx === 0 ? 'text-blue-600 block' : 'block'}>{word} </span>
                                        ))}
                                    </h2>
                                    <p className="text-base sm:text-xl lg:text-2xl text-gray-500 font-medium mb-8 sm:mb-12 leading-relaxed">
                                        {activity.description}
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10 mb-10 sm:mb-16">
                                        <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-gray-100 shadow-sm">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Duration & Gear</p>
                                            <div className="flex items-center gap-4 text-blue-950 font-black">
                                                <Clock className="w-6 h-6 text-blue-400" />
                                                <span className="text-xl">Half Day • 4 Hours</span>
                                            </div>
                                        </div>
                                        <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-gray-100 shadow-sm">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Safety Standard</p>
                                            <div className="flex items-center gap-4 text-blue-950 font-black">
                                                <Shield className="w-6 h-6 text-green-500" />
                                                <span className="text-xl">Global Certified</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-12 pt-6 sm:pt-8 border-t border-gray-100">
                                        <div className="flex-1 text-left w-full">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Activity Pass</p>
                                            <div className="flex items-baseline gap-2 mb-2">
                                                <span className="text-4xl sm:text-5xl lg:text-6xl font-black text-blue-600 tracking-tighter">₹{activity.price}</span>
                                                <span className="text-gray-400 font-bold text-sm uppercase">/ Guest</span>
                                            </div>
                                            <div className="flex items-center gap-3 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                                                <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-3" />
                                                <span className="text-[8px] font-black text-blue-950 uppercase tracking-widest">Secure UPI Payment</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleBooking(activity)}
                                            className="w-full sm:w-auto bg-blue-950 hover:bg-blue-600 text-white px-8 sm:px-16 py-5 sm:py-8 rounded-2xl sm:rounded-[2rem] font-black text-base sm:text-xl transition-all duration-500 shadow-3xl shadow-blue-950/20 active:scale-95 flex items-center justify-center gap-3 sm:gap-6 group/btn"
                                        >
                                            BOOK THIS EXPERIENCE <ChevronRight className="w-8 h-8 group-hover/btn:translate-x-4 transition-transform duration-500" />
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </section>
                )) : (
                    <div className="text-center py-64 bg-white">
                        <div className="text-9xl mb-12 animate-bounce">🌊</div>
                        <h2 className="text-5xl font-black text-blue-950 mb-4 tracking-tighter uppercase">Finding great activities for you...</h2>
                        <p className="text-xl text-gray-400 font-bold max-w-xl mx-auto">Checking live availability and ensuring all safety standards are met.</p>
                    </div>
                )}
            </div>

            {/* Professional Trust Footer */}
            <div className="bg-blue-950 py-20 sm:py-32 lg:py-40 px-4 sm:px-6 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-20"></div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="bg-blue-600/10 w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-[2.5rem] flex items-center justify-center text-blue-400 mx-auto mb-8 sm:mb-12 shadow-inner border border-blue-600/20">
                        <Target className="w-8 h-8 sm:w-12 sm:h-12" />
                    </div>
                    <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white mb-6 sm:mb-10 tracking-tighter uppercase italic">Your Safety, Guaranteed</h2>
                    <p className="text-2xl text-blue-200/40 font-medium mb-16 leading-relaxed">
                        Every activity goes through our strict safety checks. We partner only with Cherai's best, most experienced local guides.
                    </p>
                    <div className="flex flex-wrap justify-center gap-12 grayscale opacity-40">
                        {/* Placeholder for partner logos */}
                        <div className="text-white font-black tracking-widest text-lg">SAFE•TRAVELS</div>
                        <div className="text-white font-black tracking-widest text-lg">KERALA•TOURISM</div>
                        <div className="text-white font-black tracking-widest text-lg">CHERA•MARITIME</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Activities;
