import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, Map, Bell, LogOut, Lock, ArrowLeft, MoreVertical, Menu, X, Waves, Hotel, Ticket, Briefcase, Activity, Home } from 'lucide-react';
import { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, setUser } = useContext(AppContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    const handleSOS = () => {
        if (window.confirm('Trigger SOS? This will direct you to the Emergency Control.')) {
            navigate('/digital-id-login');
        }
    };

    return (
        <nav className="bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-[72px] items-center">

                    {/* Logo & Back Button */}
                    <div className="flex items-center shrink-0">
                        {location.pathname !== '/' && (
                            <button
                                onClick={() => navigate(-1)}
                                className="mr-3 p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all flex items-center justify-center lg:hidden"
                                aria-label="Go Back"
                            >
                                <ArrowLeft size={18} />
                            </button>
                        )}
                        <Link to="/" className="flex items-center gap-2">
                            <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">Keralam</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation - Main Links */}
                    <div className="hidden xl:flex items-center space-x-1 mx-4">
                        <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 hover:bg-blue-50/50"><Home size={16} /> Home</Link>
                        <Link to="/beaches" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 hover:bg-blue-50/50"><Waves size={16} /> Beaches</Link>
                        <Link to="/hotels" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 hover:bg-blue-50/50"><Hotel size={16} /> Hotels</Link>
                        <Link to="/activities" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 hover:bg-blue-50/50"><Activity size={16} /> Activities</Link>
                        <Link to="/packages" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 hover:bg-blue-50/50"><Briefcase size={16} /> Packages</Link>
                    </div>

                    {/* Desktop Navigation - Safety & Admin & Auth */}
                    <div className="hidden xl:flex items-center space-x-3 shrink-0">
                        {/* Admin Dropdown / Links */}
                        <div className="flex items-center bg-gray-50 border border-gray-100 p-1 rounded-xl">
                            <Link to="/safety-tips" className="text-rose-700 hover:bg-rose-100 px-3 py-1.5 rounded-lg text-xs font-black transition-all">Safety Tips</Link>
                            <Link to="/admin/crowd" className="text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-black transition-all">Admin Panel</Link>
                            <Link to="/kerala-dashboard" className="text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-xs font-black transition-all">State Command</Link>
                        </div>

                        {/* Safety Action Links */}
                        <div className="flex items-center gap-2 border-l border-r border-gray-200 px-3">
                            <Link to="/kerala-dashboard" className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:shadow-lg transition-all flex items-center gap-1.5">
                                <Map size={14} /> Live Safety Map
                            </Link>
                            <Link to="/digital-id-login" className="bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-cyan-600 transition-all flex items-center gap-1.5 animate-pulse">
                                Tourist ID
                            </Link>
                            <button onClick={handleSOS} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg shadow-red-500/30 flex items-center gap-1.5">
                                <ShieldAlert size={14} className="animate-bounce" /> SOS Emergency
                            </button>
                        </div>

                        {/* Auth Links */}
                        {user ? (
                            <div className="flex items-center gap-3 pl-2">
                                <Link to="/my-bookings" className="text-indigo-600 hover:text-indigo-800 text-sm font-black transition-all flex items-center gap-1">My Bookings</Link>
                                <button onClick={handleLogout} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-xs font-black hover:bg-red-100 hover:text-red-600 transition-all flex items-center gap-1.5">
                                    <LogOut size={14} /> Logout
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-blue-700 transition-all shadow-md flex items-center gap-2">
                                <Lock size={14} /> Connect
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="xl:hidden flex items-center">
                        {/* Always show SOS on mobile header as priority */}
                        <button onClick={handleSOS} className="mr-3 bg-red-500 text-white p-2 rounded-full shadow-lg shadow-red-500/40 animate-pulse">
                            <ShieldAlert size={18} />
                        </button>

                        <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none">
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile / Tablet Full Menu Overlay */}
            {isOpen && (
                <div className="xl:hidden absolute top-[72px] left-0 right-0 bg-white border-b border-gray-100 shadow-2xl overflow-y-auto max-h-[calc(100vh-72px)] pb-6">
                    <div className="px-4 pt-4 pb-6 space-y-6">

                        {/* Auth Status Mobile */}
                        {user ? (
                            <div className="bg-blue-50 rounded-2xl p-4 flex justify-between items-center border border-blue-100">
                                <div>
                                    <p className="text-xs text-blue-500 font-bold uppercase tracking-wider">Logged In As</p>
                                    <p className="text-lg font-black text-blue-900">{user.name}</p>
                                </div>
                                <button onClick={handleLogout} className="bg-white text-red-500 p-2 rounded-full shadow-sm">
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <Link to="/login" onClick={() => setIsOpen(false)} className="bg-blue-600 text-white py-3 rounded-xl text-center font-bold text-sm shadow-md flex items-center justify-center gap-2">
                                    <Lock size={16} /> Connect Account
                                </Link>
                                <Link to="/signup" onClick={() => setIsOpen(false)} className="bg-gray-100 text-gray-800 py-3 rounded-xl text-center font-bold text-sm">
                                    Register
                                </Link>
                            </div>
                        )}

                        {/* Critical Safety Actions */}
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => { handleSOS(); setIsOpen(false); }} className="col-span-2 bg-gradient-to-r from-red-500 to-rose-600 text-white p-4 rounded-2xl shadow-xl shadow-red-500/20 flex items-center justify-center gap-3">
                                <ShieldAlert size={24} className="animate-pulse" />
                                <span className="font-black text-lg tracking-wide uppercase">SOS Emergency</span>
                            </button>

                            <Link to="/digital-id-login" onClick={() => setIsOpen(false)} className="bg-cyan-500 text-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg shadow-cyan-500/20">
                                <Lock size={24} opacity={0.8} />
                                <span className="font-bold text-sm whitespace-nowrap">Tourist ID</span>
                            </Link>

                            <Link to="/kerala-dashboard" onClick={() => setIsOpen(false)} className="bg-emerald-500 text-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
                                <Map size={24} opacity={0.8} />
                                <span className="font-bold text-sm whitespace-nowrap">Live Safety Map</span>
                            </Link>
                        </div>

                        <hr className="border-gray-100" />

                        {/* Main Explorer Links */}
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Explore</p>
                            <div className="space-y-1">
                                <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-gray-700 hover:bg-gray-50 hover:text-blue-600"><Home size={20} className="text-gray-400" /> Home</Link>
                                <Link to="/beaches" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-gray-700 hover:bg-gray-50 hover:text-blue-600"><Waves size={20} className="text-blue-400" /> Beaches</Link>
                                <Link to="/hotels" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-gray-700 hover:bg-gray-50 hover:text-blue-600"><Hotel size={20} className="text-indigo-400" /> Hotels</Link>
                                <Link to="/activities" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-gray-700 hover:bg-gray-50 hover:text-blue-600"><Activity size={20} className="text-orange-400" /> Activities</Link>
                                <Link to="/packages" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-gray-700 hover:bg-gray-50 hover:text-blue-600"><Briefcase size={20} className="text-emerald-400" /> Packages</Link>
                                {user && <Link to="/my-bookings" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-gray-700 hover:bg-gray-50 hover:text-blue-600"><Ticket size={20} className="text-purple-400" /> My Bookings</Link>}
                            </div>
                        </div>

                        {/* System & Admin */}
                        <div className="bg-gray-900 rounded-2xl p-4">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">System Dashboards</p>
                            <div className="grid gap-2">
                                <Link to="/safety-tips" onClick={() => setIsOpen(false)} className="bg-rose-900/50 text-rose-200 px-4 py-3 rounded-xl text-sm font-bold flex justify-between items-center border border-rose-800/50 mb-2">
                                    Safety Tips <ArrowLeft size={16} className="rotate-180 opacity-50" />
                                </Link>
                                <Link to="/admin/crowd" onClick={() => setIsOpen(false)} className="bg-gray-800 text-gray-200 px-4 py-3 rounded-xl text-sm font-bold flex justify-between items-center border border-gray-700">
                                    Admin Panel <ArrowLeft size={16} className="rotate-180 opacity-50" />
                                </Link>
                                <Link to="/kerala-dashboard" onClick={() => setIsOpen(false)} className="bg-gradient-to-r from-gray-800 to-gray-700 text-white px-4 py-3 rounded-xl text-sm font-bold flex justify-between items-center border border-gray-600">
                                    State Command Dashboard <ArrowLeft size={16} className="rotate-180 opacity-50" />
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
