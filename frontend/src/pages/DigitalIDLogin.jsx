import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DigitalIDLogin = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1 = enter email, 2 = enter otp
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/safety/send-otp', { email });

            if (res.data.mockOtp) {
                toast.success('📱 Dev Mode: OTP is ' + res.data.mockOtp, {
                    position: "top-center",
                    autoClose: 10000, // 10 seconds to read it
                    style: { fontSize: '18px', fontWeight: 'bold', padding: '16px' }
                });
            } else {
                toast.success(res.data.message || 'OTP sent successfully!');
            }

            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error sending OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/safety/verify-otp', { email, otp });
            toast.success('Login Successful!');
            localStorage.setItem('digital_id_user', JSON.stringify(res.data.tourist));
            navigate('/digital-id-dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
            <ToastContainer />
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl shadow-2xl max-w-md w-full text-white">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                        Your Kerala Digital ID
                    </h1>
                    <p className="text-indigo-200 mt-2 text-sm">Your key to seamless travel in Kerala</p>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleSendOTP} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-indigo-100">Email Address</label>
                            <input
                                type="email"
                                placeholder="tourist@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all font-mono"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg transform active:scale-95 transition-all flex justify-center items-center"
                        >
                            {loading ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : 'Send Login Code'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-indigo-100">Enter OTP</label>
                            <input
                                type="text"
                                placeholder="123456"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all text-center tracking-widest text-2xl font-mono"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg transform active:scale-95 transition-all flex justify-center items-center"
                        >
                            {loading ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : 'Verify & Login'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-full text-indigo-300 hover:text-white text-sm transition-colors"
                        >
                            Change Email Address
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default DigitalIDLogin;
