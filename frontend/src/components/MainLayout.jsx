import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { AlertCircle } from 'lucide-react';

const MainLayout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Emergency Banner */}
            <div className="bg-rose-600 text-white py-2 px-4 shadow-md text-center flex items-center justify-center gap-2 z-[60] relative">
                <span className="font-bold text-sm tracking-wide flex items-center gap-2">
                    🚨 Emergency Help Available – Press SOS Button for Immediate Assistance
                </span>
            </div>
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
