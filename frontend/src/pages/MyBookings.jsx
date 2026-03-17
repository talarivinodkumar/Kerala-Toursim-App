import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Calendar, Package, MapPin, Search } from 'lucide-react';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const { user } = useContext(AppContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchBookings = async () => {
            const { data } = await api.get(`/bookings/my?user_id=${user.id}`);
            setBookings(data);
        };
        fetchBookings();
    }, [user, navigate]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Confirmed': return 'bg-green-100 text-green-700 border-green-200';
            case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-16 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-blue-950 mb-2">My Bookings</h1>
                        <p className="text-gray-500 font-medium">Track your upcoming trips and experiences</p>
                    </div>
                    <div className="w-16 h-16 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-600">
                        <Package className="w-8 h-8" />
                    </div>
                </div>

                {bookings.length === 0 ? (
                    <div className="text-center bg-white p-20 rounded-[3rem] shadow-xl border border-gray-100">
                        <div className="text-6xl mb-6">🏜️</div>
                        <h2 className="text-2xl font-black text-blue-900 mb-2">No bookings yet</h2>
                        <p className="text-gray-400 font-bold mb-8">Ready to explore Cherai?</p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all active:scale-95"
                        >
                            Start Exploring
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {bookings.map((booking) => (
                            <motion.div
                                key={booking.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8"
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl ${booking.booking_type === 'hotel' ? 'bg-blue-100 text-blue-600' : booking.booking_type === 'activity' ? 'bg-cyan-100 text-cyan-600' : 'bg-pink-100 text-pink-600'}`}>
                                        {booking.booking_type === 'hotel' ? '🏨' : booking.booking_type === 'activity' ? '🛶' : '🌴'}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-blue-900">{booking.item_name}</h3>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{booking.booking_type} booking</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-center gap-8 text-center md:text-left">
                                    {booking.check_in && (
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Check-in</p>
                                            <div className="flex items-center gap-1 font-black text-blue-900 text-sm">
                                                <Calendar className="w-3 h-3" /> {new Date(booking.check_in).toLocaleDateString()}
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Paid</p>
                                        <p className="font-black text-blue-600 text-lg">₹{booking.total_price}</p>
                                    </div>
                                    <div className={`px-4 py-2 rounded-xl text-xs font-black border ${getStatusColor(booking.status)}`}>
                                        {booking.status}
                                    </div>
                                    {booking.status === 'Pending' && (
                                        <button
                                            onClick={() => navigate('/payment', {
                                                state: {
                                                    bookingDetails: {
                                                        type: booking.booking_type,
                                                        itemName: booking.item_name,
                                                        totalPrice: booking.total_price,
                                                        guests: booking.guests,
                                                        dates: booking.check_in ? `${new Date(booking.check_in).toLocaleDateString()} to ${new Date(booking.check_out).toLocaleDateString()}` : null
                                                    }
                                                }
                                            })}
                                            className="bg-blue-600 text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg shadow-blue-500/20 active:scale-95"
                                        >
                                            Pay Now
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyBookings;
