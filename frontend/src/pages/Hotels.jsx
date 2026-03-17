import { useState, useEffect, useContext } from 'react';
import { Calendar, Users, Home, CheckCircle, MapPin, ChevronRight, Info, CreditCard, ArrowRight } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const Hotels = () => {
    const [hotels, setHotels] = useState([]);
    const [bookingData, setBookingData] = useState({});
    const { user } = useContext(AppContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const { data } = await api.get('/hotels');
                const filteredData = data.filter(h => h.name.toLowerCase() !== 'vinod');
                setHotels(filteredData);
                // Initialize booking data for each room
                const initialBookingState = {};
                filteredData.forEach(hotel => {
                    hotel.rooms?.forEach(room => {
                        initialBookingState[room.id] = {
                            checkIn: '',
                            checkOut: '',
                            guests: 1
                        };
                    });
                });
                setBookingData(initialBookingState);
            } catch (error) {
                setHotels([]);
            }
        };
        fetchHotels();
    }, []);

    const updateRoomBooking = (roomId, field, value) => {
        setBookingData(prev => ({
            ...prev,
            [roomId]: {
                ...prev[roomId],
                [field]: value
            }
        }));
    };

    const handleBooking = async (hotel, room) => {
        const data = bookingData[room.id];
        if (!user) {
            alert('Please login to book a hotel!');
            navigate('/login');
            return;
        }

        if (!data.checkIn || !data.checkOut) {
            alert('Please select check-in and check-out dates.');
            return;
        }

        try {
            const nights = Math.ceil((new Date(data.checkOut) - new Date(data.checkIn)) / (1000 * 60 * 60 * 24));
            if (nights <= 0) {
                alert('Checkout date must be after check-in date.');
                return;
            }

            const totalPrice = nights * room.price_per_night;

            const { data: bookingResult } = await api.post('/bookings', {
                user_id: user.id,
                booking_type: 'hotel',
                item_id: room.id,
                check_in: data.checkIn,
                check_out: data.checkOut,
                guests: data.guests,
                total_price: totalPrice
            });

            navigate('/payment', {
                state: {
                    bookingDetails: {
                        id: bookingResult.booking_id,
                        type: 'Hotel Stay',
                        itemName: `${hotel.name} - ${room.room_type}`,
                        totalPrice,
                        guests: data.guests,
                        dates: `${data.checkIn} to ${data.checkOut}`
                    }
                }
            });
        } catch (error) {
            alert('Booking failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Professional Header Section */}
            <div className="bg-white py-12 px-6 relative overflow-hidden border-b border-gray-100">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-50/50 skew-x-12 translate-x-1/2"></div>
                <div className="max-w-7xl mx-auto relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center lg:text-left"
                    >
                        <h1 className="text-6xl lg:text-8xl font-black text-blue-950 mb-6 tracking-tighter">
                            Luxury Stays <br /> <span className="text-blue-600">& Coastal Villas</span>
                        </h1>
                        <p className="text-xl text-gray-500 font-medium max-w-2xl leading-relaxed">
                            Discover the finest resorts in Cherai. We've handpicked each stay to ensure you a comfortable, memorable, and authentic Kerala experience.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-8 pb-16">
                <div className="space-y-16">
                    {hotels.length > 0 ? hotels.map((hotel) => (
                        <div key={hotel.id} className="relative group">
                            {/* Hotel Image & Rooms Layout */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-6">
                                {/* Large Featured Image */}
                                <div className="lg:col-span-12 h-[450px] rounded-[3rem] overflow-hidden shadow-2xl relative">
                                    <img
                                        src={Array.isArray(hotel.images) ? hotel.images[0] : (typeof hotel.images === 'string' && hotel.images.startsWith('[') ? JSON.parse(hotel.images)[0] : hotel.images) || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200'}
                                        className="w-full h-full object-cover"
                                        alt={hotel.name}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-blue-950/20 to-transparent"></div>
                                </div>

                                {/* Room Listings - Modern Vertical Stack */}
                                <div className="lg:col-span-12 space-y-8">
                                    <div className="grid grid-cols-1 gap-8">
                                        {hotel.rooms?.map((room) => (
                                            <motion.div
                                                key={room.id}
                                                whileHover={{ y: -10 }}
                                                className="bg-white rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-50 flex flex-col xl:flex-row overflow-hidden group/room"
                                            >
                                                {/* Room Image Section */}
                                                <div className="xl:w-[400px] h-[300px] xl:h-auto overflow-hidden relative">
                                                    <img
                                                        src={room.image || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover/room:scale-110"
                                                        alt={room.room_type}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                                </div>
                                                <div className="p-12 xl:p-16 flex-1 text-left">
                                                    <div className="flex items-center gap-4 mb-6">
                                                        <h4 className="text-4xl font-black text-blue-950 tracking-tighter uppercase">{room.room_type}</h4>
                                                        <div className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">Best Seller</div>
                                                    </div>
                                                    <p className="text-lg text-gray-500 font-medium mb-10 leading-relaxed max-w-2xl">{room.description}</p>

                                                    <div className="flex flex-wrap gap-6 mb-8">
                                                        <div className="flex items-center gap-2 bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100 text-sm font-black text-blue-900">
                                                            <Users className="w-5 h-5 text-blue-400" /> Max {room.capacity}
                                                        </div>
                                                        <div className="flex items-center gap-2 bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100 text-sm font-black text-green-600">
                                                            <CheckCircle className="w-5 h-5" /> Free High-Speed WiFi
                                                        </div>
                                                        <div className="flex items-center gap-2 bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100 text-sm font-black text-orange-500">
                                                            <Info className="w-5 h-5" /> All-Inclusive Meals
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Professional Booking Panel */}
                                                <div className="bg-blue-50/50 p-12 xl:p-16 xl:w-[450px] border-l border-gray-50">
                                                    <div className="mb-10 text-center xl:text-right">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Price Per Night</p>
                                                        <div className="text-5xl font-black text-blue-600 tracking-tighter">₹{room.price_per_night}</div>
                                                        <p className="text-xs text-blue-300 font-bold uppercase mt-1">Special Deal</p>
                                                    </div>

                                                    <div className="space-y-6 bg-white p-8 rounded-[3rem] shadow-xl border border-blue-50">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="text-left">
                                                                <label className="text-[10px] font-black text-blue-900 uppercase block mb-3 pl-2">Check-in</label>
                                                                <input
                                                                    type="date"
                                                                    className="w-full bg-blue-50/50 p-4 rounded-2xl text-sm font-black border border-transparent focus:border-blue-500 outline-none transition-all cursor-pointer"
                                                                    value={bookingData[room.id]?.checkIn}
                                                                    onChange={(e) => updateRoomBooking(room.id, 'checkIn', e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="text-left">
                                                                <label className="text-[10px] font-black text-blue-900 uppercase block mb-3 pl-2">Check-out</label>
                                                                <input
                                                                    type="date"
                                                                    className="w-full bg-blue-50/50 p-4 rounded-2xl text-sm font-black border border-transparent focus:border-blue-500 outline-none transition-all cursor-pointer"
                                                                    value={bookingData[room.id]?.checkOut}
                                                                    onChange={(e) => updateRoomBooking(room.id, 'checkOut', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="text-left">
                                                            <label className="text-[10px] font-black text-blue-900 uppercase block mb-3 pl-2">Guests</label>
                                                            <select
                                                                className="w-full bg-blue-50/50 p-4 rounded-2xl text-sm font-black border border-transparent focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                                                value={bookingData[room.id]?.guests}
                                                                onChange={(e) => updateRoomBooking(room.id, 'guests', parseInt(e.target.value))}
                                                            >
                                                                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
                                                            </select>
                                                        </div>

                                                        <div className="flex items-center justify-center gap-4 py-4 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                                                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1200px-UPI-Logo-vector.svg.png" alt="UPI" className="h-4" />
                                                            <div className="h-4 w-px bg-gray-200"></div>
                                                            <CreditCard className="w-5 h-5 text-blue-900" />
                                                            <span className="text-[9px] font-black text-blue-950 uppercase tracking-widest">Secure Checkout</span>
                                                        </div>

                                                        <button
                                                            onClick={() => handleBooking(hotel, room)}
                                                            className="w-full bg-blue-950 hover:bg-blue-600 text-white py-8 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 transition-all duration-500 active:scale-95 shadow-3xl shadow-blue-950/20 group/btn"
                                                        >
                                                            BOOK YOUR STAY <ArrowRight className="w-7 h-7 group-hover:translate-x-3 transition-transform duration-500" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-64 bg-white rounded-[5rem] shadow-2xl border border-gray-100">
                            <div className="text-9xl mb-12 animate-bounce">🏨</div>
                            <h2 className="text-5xl font-black text-blue-950 mb-4 tracking-tighter">Finding perfect stays for you...</h2>
                            <p className="text-xl text-gray-400 font-bold max-w-xl mx-auto">We're checking live availability for the best resorts in Cherai...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Global Trust Banner */}
            <div className="bg-blue-950 py-16 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="bg-blue-600 w-20 h-20 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-10 shadow-2xl">
                        <CreditCard className="w-10 h-10" />
                    </div>
                    <h2 className="text-5xl font-black text-white mb-8 tracking-tighter italic">Secure Booking Guarantee</h2>
                    <p className="text-xl text-blue-200/50 font-medium mb-12">
                        Your bookings are 100% secure. You'll receive an instant digital voucher for a smooth check-in at the resort.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Hotels;
