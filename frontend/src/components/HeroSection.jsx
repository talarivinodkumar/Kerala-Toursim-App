import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const HeroSection = ({ title, subtitle, image }) => {
    return (
        <div className="relative h-screen bg-cover bg-center flex items-center justify-center overflow-hidden"
            style={{ backgroundImage: `url(${image})` }}>
            {/* Dark evening overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>

            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                <motion.h1
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] font-sans tracking-tight"
                >
                    <span className="text-transparent bg-clip-text bg-gradient-to-t from-orange-200 to-white">{title}</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="text-xl md:text-2xl text-white/90 font-light drop-shadow-md"
                >
                    {subtitle}
                </motion.p>
                {/* Content ends here */}
            </div>
        </div>
    );
};

export default HeroSection;
