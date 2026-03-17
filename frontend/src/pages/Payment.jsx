import api from '../services/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowLeft, Copy, CreditCard, ShieldCheck, Loader2 } from 'lucide-react';
import { useState } from 'react';

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { bookingDetails } = location.state || {};
    const [copied, setCopied] = useState(false);
    const [paymentDone, setPaymentDone] = useState(false);
    const [loading, setLoading] = useState(false);

    const upiId = "9059143860@ybl";

    const confirmPayment = async () => {
        setLoading(true);
        try {
            await api.put(`/bookings/${bookingDetails.id}`, {
                status: 'Confirmed',
                payment_status: 'Paid'
            });
            setPaymentDone(true);
        } catch (error) {
            console.error('Payment confirmation failed:', error);
            alert('Could not sync payment status. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const copyUpi = () => {
        navigator.clipboard.writeText(upiId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!bookingDetails) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="text-8xl mb-8">🚫</div>
                <h2 className="text-3xl font-black text-blue-950 mb-4 tracking-tighter uppercase">No Active Booking</h2>
                <p className="text-gray-400 font-bold mb-10 max-w-xs">It looks like you haven't selected an experience yet.</p>
                <button
                    onClick={() => navigate('/')}
                    className="bg-blue-600 text-white px-12 py-4 rounded-full font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
                >
                    Return to Home
                </button>
            </div>
        );
    }

    if (paymentDone) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-400"></div>
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative z-10"
                >
                    <div className="w-40 h-40 bg-green-50 rounded-[3rem] flex items-center justify-center mx-auto mb-12 shadow-2xl border-4 border-white">
                        <CheckCircle className="w-24 h-24 text-green-500" strokeWidth={3} />
                    </div>
                    <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black text-blue-950 mb-6 tracking-tighter uppercase">
                        Booking <br /> <span className="text-green-500">Successful!</span>
                    </h1>
                    <p className="text-xl text-gray-500 font-medium max-w-lg mx-auto mb-16 leading-relaxed">
                        Your request for <span className="text-blue-600 font-black">"{bookingDetails.itemName}"</span> is now being processed. We've sent the details to the resort desk.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <button
                            onClick={() => navigate('/my-bookings')}
                            className="bg-blue-950 text-white px-12 py-6 rounded-[2rem] font-black text-lg uppercase tracking-widest shadow-3xl hover:bg-blue-800 transition-all active:scale-95"
                        >
                            View My Bookings
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-white text-blue-950 border-4 border-blue-950 px-12 py-6 rounded-[2rem] font-black text-lg uppercase tracking-widest shadow-xl hover:bg-gray-50 transition-all active:scale-95"
                        >
                            Back to Home
                        </button>
                    </div>
                </motion.div>
                {/* Abstract UI Elements */}
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-green-50 rounded-full blur-3xl opacity-40"></div>
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-40"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-12">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block px-6 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-blue-100"
                    >
                        Secure Checkout Portal
                    </motion.div>
                    <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-blue-950 mb-4 tracking-tighter uppercase">
                        Confirm <span className="text-blue-600">Payment</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-lg leading-relaxed">
                        Scan the code below or use the UPI ID to complete your booking.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    {/* Booking Summary */}
                    <div className="bg-gray-50 p-6 sm:p-10 rounded-2xl sm:rounded-[3.5rem] border border-gray-100 shadow-sm">
                        <h3 className="text-2xl font-black text-blue-950 mb-8 border-b border-gray-200 pb-4">Trip Summary</h3>
                        <div className="space-y-6">
                            <div className="flex justify-between">
                                <span className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]">Selected Experience</span>
                                <span className="text-blue-950 font-black uppercase text-sm">{bookingDetails.itemName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]">Service Level</span>
                                <span className="text-blue-600 font-black uppercase text-sm italic">{bookingDetails.type}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]">Group Size</span>
                                <span className="text-blue-950 font-black uppercase text-sm">{bookingDetails.guests} Person(s)</span>
                            </div>
                            {bookingDetails.dates && (
                                <div className="flex justify-between">
                                    <span className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]">Travel window</span>
                                    <span className="text-blue-950 font-black uppercase text-sm italic">{bookingDetails.dates}</span>
                                </div>
                            )}
                            <div className="h-px bg-gray-200 my-8"></div>
                            <div className="flex justify-between items-end">
                                <span className="text-blue-950 font-black text-xs uppercase tracking-[0.3em]">Payable Amount</span>
                                <span className="text-4xl sm:text-6xl font-black text-blue-600 tracking-tighter">₹{bookingDetails.totalPrice}</span>
                            </div>
                        </div>
                    </div>

                    {/* QR Code & UPI Details */}
                    <div className="bg-blue-950 p-6 sm:p-10 rounded-2xl sm:rounded-[3.5rem] text-white shadow-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/30 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-blue-600/50 transition-all duration-700"></div>

                        <div className="relative z-10 text-center">

                            {/* PhonePe Header */}
                            <div className="flex items-center justify-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-[#5f259f] flex items-center justify-center text-white font-black text-lg shadow-lg">₱</div>
                                <span className="text-xl font-black tracking-wide text-white">PhonePe</span>
                            </div>
                            <p className="text-purple-300 font-black text-[10px] uppercase tracking-[0.3em] mb-6">✦ ACCEPTED HERE ✦</p>

                            {/* QR Code Image — amount pre-filled so customer just scans & confirms */}
                            <div className="bg-white p-5 rounded-[2rem] mb-6 inline-block shadow-2xl mx-auto border-4 border-purple-500/30 transition-transform hover:scale-[1.02] duration-500">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(`upi://pay?pa=9059143860@ybl&pn=VINOD KUMAR T&am=${bookingDetails.totalPrice}&cu=INR`)}&color=000000&bgcolor=ffffff&format=png`}
                                    alt={`PhonePe QR - Pay ₹${bookingDetails.totalPrice} to VINOD KUMAR T`}
                                    className="w-56 h-56 object-contain rounded-xl"
                                />
                            </div>

                            {/* Amount Badge */}
                            <div className="mb-6">
                                <p className="text-blue-300/60 font-black text-[9px] uppercase tracking-[0.4em] mb-2">Amount to Pay</p>
                                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-500 px-8 py-4 rounded-2xl shadow-lg shadow-purple-600/30">
                                    <span className="text-4xl font-black text-white tracking-tighter">₹{bookingDetails.totalPrice}</span>
                                </div>
                                <p className="text-blue-300/40 text-[9px] font-bold uppercase tracking-widest mt-2">Scan & Pay Using PhonePe App</p>
                            </div>

                            {/* UPI ID */}
                            <div className="space-y-4 mb-10">
                                <p className="text-blue-300/40 font-black text-[9px] uppercase tracking-[0.4em]">UPI ID</p>
                                <div className="bg-white/10 backdrop-blur-xl p-5 rounded-3xl flex items-center justify-between border border-white/10 group/id">
                                    <span className="font-black tracking-widest text-blue-100 uppercase">{upiId}</span>
                                    <button
                                        onClick={copyUpi}
                                        className="bg-purple-600 hover:bg-cyan-500 p-2.5 rounded-2xl transition-all active:scale-90 shadow-lg"
                                    >
                                        {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                                    </button>
                                </div>
                                <p className="text-blue-400/50 text-[9px] font-bold uppercase tracking-widest">VINOD KUMAR T</p>
                            </div>

                            <button
                                onClick={confirmPayment}
                                disabled={loading}
                                className="w-full bg-purple-600 hover:bg-green-500 text-white py-6 rounded-[2.2rem] font-black text-xl mb-10 transition-all duration-500 flex items-center justify-center gap-4 shadow-3xl shadow-purple-600/20 group/confirm disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" size={24} /> : (
                                    <>I HAVE PAID <CheckCircle className="w-7 h-7 group-hover/confirm:scale-125 transition-transform" /></>
                                )}
                            </button>

                            <div className="flex items-start gap-4 text-left bg-white/5 p-6 rounded-3xl border border-white/10">
                                <ShieldCheck className="text-purple-400 w-8 h-8 flex-shrink-0" strokeWidth={2.5} />
                                <p className="text-[10px] font-bold text-blue-200/50 leading-relaxed uppercase tracking-widest">
                                    Booking is instantly held once you click confirm. Please keep a screenshot of the transaction.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-20 text-center">
                    <button
                        onClick={() => navigate('/my-bookings')}
                        className="flex items-center gap-4 mx-auto text-gray-400 font-black text-[10px] uppercase tracking-[0.5em] hover:text-blue-600 transition-all group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" /> Return To Portfolio
                    </button>
                    <div className="mt-16 flex items-center justify-center gap-10 opacity-20 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-1000">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-4" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c7/Google_Pay_Logo.svg" alt="GPay" className="h-4" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" alt="Paytm" className="h-4" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/PhonePe_Logo.png" alt="PhonePe" className="h-4" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;
