import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import { User, Lock } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { setUser } = useContext(AppContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/users/login', { email, password });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            navigate('/');
        } catch (error) {
            setError(error.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1920&q=80")' }}>
            {/* Overlay for better readability */}
            <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-[2px] z-0"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-[90%] bg-white p-12 rounded-[2.5rem] shadow-2xl relative z-10"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-blue-900 mb-6 drop-shadow-sm">Welcome Back!</h2>

                    {/* Styled Logo Placeholder matching user image */}
                    <div className="flex justify-center mb-8">
                        <div className="w-28 h-28 bg-gradient-to-b from-blue-50 to-white rounded-full flex items-center justify-center border border-blue-100 shadow-inner relative overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center opacity-80 text-5xl">
                                🏖️
                            </div>
                            <div className="absolute bottom-2 w-full h-8 bg-blue-400/20 blur-xl"></div>
                        </div>
                    </div>
                </div>

                {error && <div className="mb-6 bg-red-50 text-red-500 text-center text-sm font-bold py-3 px-4 rounded-2xl border border-red-100">{error}</div>}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-blue-400 group-focus-within:text-blue-600 transition-colors" />
                        </div>
                        <input
                            type="email"
                            required
                            className="block w-full pl-14 pr-4 py-4 bg-gray-50 border-2 border-gray-50 text-gray-900 rounded-2xl focus:outline-none focus:ring-0 focus:border-blue-400 focus:bg-white transition-all text-sm font-semibold"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-blue-400 group-focus-within:text-blue-600 transition-colors" />
                        </div>
                        <input
                            type="password"
                            required
                            className="block w-full pl-14 pr-4 py-4 bg-gray-50 border-2 border-gray-50 text-gray-900 rounded-2xl focus:outline-none focus:ring-0 focus:border-blue-400 focus:bg-white transition-all text-sm font-semibold"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="text-right">
                        <Link to="/forgot-password" className="text-xs font-bold text-blue-800 hover:text-blue-600 transition-colors">Forgot Password?</Link>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4.5 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-black rounded-2xl shadow-[0_10px_25px_rgba(37,99,235,0.3)] transition-all transform active:scale-95 text-lg mt-2"
                    >
                        Login
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-400 font-bold">
                        Don't have an account? <Link to="/signup" className="text-blue-600 font-black hover:underline cursor-pointer">Sign Up</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
