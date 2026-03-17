import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import api from '../services/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            // Assuming this endpoint exists or will be created
            await api.post('/users/forgot-password', { email });
            setStatus('success');
            setMessage('Password reset link has been sent to your email.');
        } catch (error) {
            setStatus('error');
            setMessage(error.response?.data?.message || 'Failed to send reset link. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1920&q=80")' }}>
            {/* Overlay */}
            <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-[2px] z-0"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-[90%] bg-white p-10 rounded-[2.5rem] shadow-2xl relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100 shadow-inner">
                            <span className="text-4xl">🔐</span>
                        </div>
                    </div>
                    <h2 className="text-3xl font-black text-blue-900 mb-2">Forgot Password?</h2>
                    <p className="text-gray-500 font-medium text-sm">
                        No worries! Enter your email and we'll send you reset instructions.
                    </p>
                </div>

                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-6 text-center text-sm font-bold py-3 px-4 rounded-2xl border ${status === 'success'
                                ? 'bg-green-50 text-green-600 border-green-100'
                                : 'bg-red-50 text-red-500 border-red-100'
                            }`}
                    >
                        {message}
                    </motion.div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-blue-400 group-focus-within:text-blue-600 transition-colors" />
                        </div>
                        <input
                            type="email"
                            required
                            className="block w-full pl-14 pr-4 py-4 bg-gray-50 border-2 border-gray-50 text-gray-900 rounded-2xl focus:outline-none focus:ring-0 focus:border-blue-400 focus:bg-white transition-all text-sm font-semibold placeholder-gray-400"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={status === 'loading' || status === 'success'}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={status === 'loading' || status === 'success'}
                        className="w-full py-4 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-black rounded-2xl shadow-[0_10px_25px_rgba(37,99,235,0.3)] transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {status === 'loading' ? (
                            <span className="animate-pulse">Sending...</span>
                        ) : (
                            <>
                                Send Reset Link <Send className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-sm text-gray-500 font-bold hover:text-blue-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
