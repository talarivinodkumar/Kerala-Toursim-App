import { ShieldAlert, LifeBuoy, Phone, AlertTriangle, Navigation, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SafetyTips = () => {
    const navigate = useNavigate();

    const handleSOS = () => {
        if (window.confirm('Trigger SOS? This will direct you to the Emergency Control.')) {
            navigate('/digital-id-login');
        }
    };
    const guidelines = [
        {
            title: "Understand Geo-fence Zones",
            desc: "Always check the current zone color displayed on your Tourist ID. Safe (Green), Warning (Yellow), and Danger (Red). Never enter red zones.",
            icon: <Map className="text-emerald-500 w-8 h-8" />
        },
        {
            title: "GPS Always Active",
            desc: "Ensure your mobile device location is turned on. The State Command Center monitors your proximity to dangerous shorelines in real-time.",
            icon: <Navigation className="text-blue-500 w-8 h-8" />
        },
        {
            title: "Use SOS Only in Emergencies",
            desc: "The SOS Emergency button instantly dispatches local lifeguards and alerts the Kerala State Command Dashboard with your exact coordinates.",
            icon: <ShieldAlert className="text-rose-500 w-8 h-8" />
        },
        {
            title: "Lifeguard Instructions",
            desc: "Always swim between the designated flags. Listen to whistle commands from monitoring lifeguards and drone alerts.",
            icon: <LifeBuoy className="text-orange-500 w-8 h-8" />
        }
    ];

    const emergencyContacts = [
        { name: "Kerala Police Control Room", number: "112", desc: "For immediate safety threats" },
        { name: "Coastal Police Station", number: "1093", desc: "Dedicated marine safety" },
        { name: "Ambulance / Medical", number: "108", desc: "For medical emergencies on the beach" },
        { name: "Tourism Police", number: "0471-2321882", desc: "Special assistance for tourists" }
    ];

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            {/* Header */}
            <div className="bg-[#0f172a] text-white pt-24 pb-20 px-6 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-orange-500/10 pointer-events-none" />
                <div className="max-w-4xl mx-auto relative z-10 text-center">
                    <ShieldAlert size={48} className="mx-auto text-rose-500 mb-6 animate-pulse" />
                    <h1 className="text-5xl lg:text-7xl font-black mb-6 tracking-tight">
                        Safety <span className="text-rose-400">First</span>
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto font-medium">
                        Your safety is our highest priority. Review our strict beach guidelines and familiarize yourself with emergency protocols before stepping onto the sand.
                    </p>
                </div>
            </div>

            {/* Content Container */}
            <div className="max-w-7xl mx-auto px-6 mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* Guidelines Section */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center gap-3 text-slate-900 border-b border-slate-200 pb-4">
                        <AlertTriangle className="text-amber-500" size={28} />
                        <h2 className="text-3xl font-black tracking-tight">Smart Beach Guidelines</h2>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                        {guidelines.map((guide, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-[2rem] shadow-md border border-slate-100 hover:shadow-xl transition-shadow flex flex-col items-start gap-4 h-full">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    {guide.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl text-slate-800 mb-2">{guide.title}</h3>
                                    <p className="text-slate-500 leading-relaxed font-medium text-sm">
                                        {guide.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Lifeguard Note */}
                    <div className="mt-8 bg-blue-50 border border-blue-100 rounded-[2rem] p-8 flex items-center gap-6">
                        <div className="bg-blue-100 p-4 rounded-full text-blue-600 shrink-0">
                            <LifeBuoy size={32} />
                        </div>
                        <div>
                            <h3 className="text-blue-900 font-bold text-xl mb-1">Lifeguard Locations</h3>
                            <p className="text-blue-700/80 font-medium">
                                Monitored beaches feature watchtowers every 300 meters. Always stay within the designated green zones shown on your Live Safety Map.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Emergency Contacts */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="flex items-center gap-3 text-slate-900 pb-4">
                        <Phone className="text-rose-500" size={24} />
                        <h2 className="text-2xl font-black tracking-tight">Emergency Contacts</h2>
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-6 flex flex-col gap-4">
                        {emergencyContacts.map((contact, idx) => (
                            <div key={idx} className={`p-4 rounded-2xl border ${contact.name === 'Kerala Police Control Room' ? 'bg-rose-50 border-rose-200 shadow-sm' : 'bg-slate-50 border-slate-100'}`}>
                                <h4 className={`font-bold text-lg mb-1 ${contact.name === 'Kerala Police Control Room' ? 'text-rose-700' : 'text-slate-800'}`}>
                                    {contact.name}
                                </h4>
                                <p className="font-black text-2xl tracking-widest text-slate-900 mb-2">{contact.number}</p>
                                <p className="text-xs font-bold text-slate-500 uppercase">{contact.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-slate-900 rounded-[2rem] p-8 text-center shadow-xl mt-6">
                        <ShieldAlert size={40} className="mx-auto text-rose-500 mb-4 animate-pulse" />
                        <h3 className="text-white font-black text-xl mb-3">Trigger an Alert</h3>
                        <p className="text-slate-400 text-sm font-medium mb-6">
                            Pressing the SOS button instantly dispatches your location.
                        </p>
                        <button
                            onClick={handleSOS}
                            className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all"
                        >
                            SOS EMERGENCY
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SafetyTips;
