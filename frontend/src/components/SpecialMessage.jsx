import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

const SpecialMessage = ({ message, image }) => {
    return (
        <section className="py-20 bg-gradient-to-b from-pink-50 to-white overflow-hidden">
            <div className="max-w-4xl mx-auto px-4 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative bg-white p-10 rounded-3xl shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-500"
                >
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-red-500 text-white p-3 rounded-full shadow-lg animate-bounce">
                        <Heart fill="currentColor" size={32} />
                    </div>

                    <h2 className="text-4xl font-bold text-gray-800 mb-6 romantic-text mt-4">For My Love</h2>

                    <div className="mb-8 overflow-hidden rounded-xl shadow-lg border-4 border-white transform hover:scale-[1.02] transition-transform duration-500">
                        <img src={image} alt="Us" className="w-full h-80 object-cover" />
                    </div>

                    <p className="text-xl text-gray-600 leading-relaxed font-serif italic">
                        "{message}"
                    </p>

                    <div className="mt-8 flex justify-center gap-2">
                        {[...Array(5)].map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
                            >
                                <Heart className="text-pink-400 fill-pink-200" size={24} />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default SpecialMessage;
