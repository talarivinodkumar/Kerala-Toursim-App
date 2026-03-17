import { Link } from 'react-router-dom';
import {
    Instagram,
    Youtube,
    Facebook,
    Twitter,
    ShieldAlert,
    MapPin,
    LifeBuoy,
    Phone,
    Mail,
    AlertTriangle,
    Shield,
    Heart
} from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-[#0B2B19] text-emerald-50 pt-16 pb-8 mt-auto border-t-[4px] border-[#D4AF37] relative overflow-hidden">
            {/* Subtle Coconut Leaf Green Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#113F25]/0 to-[#113F25]/40 pointer-events-none"></div>

            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-16">

                    {/* 1. Brand Section */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="flex flex-col space-y-1">
                            <div className="flex items-center space-x-2">
                                <span className="text-3xl">🌴</span>
                                <h2 className="text-3xl font-black tracking-widest text-[#D4AF37] uppercase font-serif">
                                    Keralam
                                </h2>
                            </div>
                            <span className="text-sm tracking-[0.2em] text-emerald-300 font-bold ml-1 uppercase">God's Own Country</span>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-white font-bold text-lg leading-tight">
                                Keralam Smart Tourism Network
                            </h3>
                            <p className="text-emerald-200/80 text-sm leading-relaxed max-w-sm">
                                Ensuring safe, memorable travel experiences across Kerala with our innovative smart safety network.
                            </p>
                        </div>
                    </div>

                    {/* 2. Explore Kerala */}
                    <div className="lg:col-span-2">
                        <h3 className="text-white font-bold mb-6 flex items-center gap-2 uppercase tracking-wider text-sm">
                            <MapPin className="w-5 h-5 text-[#D4AF37]" />
                            Explore Kerala
                        </h3>
                        <ul className="space-y-3 text-sm text-emerald-200/80">
                            <li><Link to="/cherai" className="hover:text-[#D4AF37] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></span> Beaches</Link></li>
                            <li><Link to="/hotels" className="hover:text-[#D4AF37] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></span> Hotels & Resorts</Link></li>
                            <li><Link to="/activities" className="hover:text-[#D4AF37] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></span> Activities</Link></li>
                            <li><Link to="/packages" className="hover:text-[#D4AF37] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></span> Travel Packages</Link></li>
                            <li><Link to="/places" className="hover:text-[#D4AF37] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></span> Must Visit Places</Link></li>
                        </ul>
                    </div>

                    {/* 3. Safety Services Section */}
                    <div className="lg:col-span-2">
                        <h3 className="text-white font-bold mb-6 flex items-center gap-2 uppercase tracking-wider text-sm">
                            <Shield className="w-5 h-5 text-[#D4AF37]" />
                            Safety Services
                        </h3>
                        <ul className="space-y-3 text-sm text-emerald-200/80">
                            <li><Link to="/kerala-dashboard" className="hover:text-emerald-300 transition-colors font-bold text-emerald-100 flex items-center gap-2"><MapPin size={14} className="text-emerald-400" /> Live Safety Map</Link></li>
                            <li><button onClick={() => window.confirm('Trigger SOS?')} className="hover:text-rose-400 transition-colors text-rose-300 font-bold flex items-center gap-2"><ShieldAlert size={14} className="text-rose-500 animate-pulse" /> SOS Emergency</button></li>
                            <li><Link to="/digital-id-login" className="hover:text-emerald-300 transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></span> Get Digital ID</Link></li>
                            <li><Link to="/kerala-dashboard" className="hover:text-amber-400 transition-colors flex items-center gap-2"><AlertTriangle size={14} className="text-amber-500" /> Beach Risk Alerts</Link></li>
                        </ul>
                    </div>

                    {/* 4. Support Section */}
                    <div className="lg:col-span-2">
                        <h3 className="text-white font-bold mb-6 flex items-center gap-2 uppercase tracking-wider text-sm">
                            <LifeBuoy className="w-5 h-5 text-[#D4AF37]" />
                            Support
                        </h3>
                        <ul className="space-y-3 text-sm text-emerald-200/80">
                            <li><Link to="#" className="hover:text-[#D4AF37] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></span> Help Center</Link></li>
                            <li><Link to="#" className="hover:text-[#D4AF37] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></span> FAQs</Link></li>
                            <li><Link to="#" className="hover:text-[#D4AF37] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></span> Privacy Policy</Link></li>
                            <li><Link to="#" className="hover:text-[#D4AF37] transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></span> Terms of Service</Link></li>
                            <li><Link to="#" className="hover:text-rose-300 transition-colors flex items-center gap-2 "><AlertTriangle size={14} className="text-rose-400/80" /> Report Safety Issue</Link></li>
                        </ul>
                    </div>

                    {/* 5. Contact Section */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h3 className="text-white font-bold mb-6 flex items-center gap-2 uppercase tracking-wider text-sm">
                                <Phone className="w-5 h-5 text-[#D4AF37]" />
                                Contact
                            </h3>
                            <div className="space-y-4">
                                <p className="text-sm font-bold text-white">Kerala Tourism Support</p>

                                <div className="bg-[#1a4229] border border-[#275c3b] p-3 rounded-lg shadow-inner">
                                    <p className="text-xs text-emerald-200 uppercase tracking-widest font-bold mb-1">Emergency Helpline</p>
                                    <p className="text-2xl font-black text-rose-400 flex items-center gap-2">
                                        <Phone size={20} className="animate-pulse" /> 112
                                    </p>
                                </div>

                                <p className="text-sm flex items-center gap-2 text-emerald-200/80 hover:text-white transition-colors cursor-pointer">
                                    <Mail className="w-4 h-4 text-[#D4AF37]" />
                                    support@keralam.com
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Connect Divider */}
                <div className="border-t border-[#1e4a2e] pt-8 pb-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <p className="text-white font-bold mb-1">Connect With Us</p>
                        <p className="text-xs text-emerald-300/80">Stay updated on the latest tourism offers, safety alerts, and beach activities.</p>
                    </div>
                    <div className="flex gap-4">
                        <a href="#" className="w-12 h-12 bg-[#163b24] hover:bg-[#D4AF37] border border-[#275c3b] hover:border-[#D4AF37] rounded-full flex items-center justify-center hover:-translate-y-1 transition-all duration-300 text-emerald-100 hover:text-[#0B2B19] shadow-lg">
                            <Instagram className="w-5 h-5" />
                        </a>
                        <a href="#" className="w-12 h-12 bg-[#163b24] hover:bg-[#D4AF37] border border-[#275c3b] hover:border-[#D4AF37] rounded-full flex items-center justify-center hover:-translate-y-1 transition-all duration-300 text-emerald-100 hover:text-[#0B2B19] shadow-lg">
                            <Facebook className="w-5 h-5" />
                        </a>
                        <a href="#" className="w-12 h-12 bg-[#163b24] hover:bg-[#D4AF37] border border-[#275c3b] hover:border-[#D4AF37] rounded-full flex items-center justify-center hover:-translate-y-1 transition-all duration-300 text-emerald-100 hover:text-[#0B2B19] shadow-lg">
                            <Twitter className="w-5 h-5" />
                        </a>
                        <a href="#" className="w-12 h-12 bg-[#163b24] hover:bg-[#D4AF37] border border-[#275c3b] hover:border-[#D4AF37] rounded-full flex items-center justify-center hover:-translate-y-1 transition-all duration-300 text-emerald-100 hover:text-[#0B2B19] shadow-lg">
                            <Youtube className="w-5 h-5" />
                        </a>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="bg-[#071f11] -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-6 flex flex-col items-center justify-center text-center gap-2">
                    <p className="text-sm text-emerald-400 font-bold">
                        &copy; {new Date().getFullYear()} Keralam Smart Tourism Network
                    </p>
                    <p className="text-xs text-emerald-500/60 uppercase tracking-widest font-semibold flex items-center justify-center gap-2">
                        Designed for Smart Coastal Safety across Kerala Beaches <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;


