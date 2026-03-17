import { useEffect, useState } from "react";
import { getWeather } from "../services/weatherService";
import { motion } from "framer-motion";
import { Sun, Cloud, Thermometer, Wind, Droplets } from "lucide-react";

const Weather = () => {
    const [weather, setWeather] = useState(null);

    useEffect(() => {
        const fetchWeather = () => {
            getWeather().then(data => setWeather(data));
        };

        fetchWeather(); // Initial fetch
        const interval = setInterval(fetchWeather, 300000); // Update every 5 minutes

        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    if (!weather) return (
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl animate-pulse text-white">
            Loading weather...
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/20 backdrop-blur-xl p-6 rounded-3xl border border-white/30 shadow-2xl text-white inline-block"
        >
            <div className="flex items-center gap-6">
                <div className="text-center border-r border-white/20 pr-6">
                    <h2 className="text-sm uppercase tracking-widest opacity-80 mb-1">Current Weather</h2>
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-5xl font-bold">{Math.round(weather.main.temp)}°C</span>
                        {weather.main.temp > 25 ? <Sun className="text-yellow-300 fill-yellow-300" size={32} /> : <Cloud size={32} />}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm font-medium">
                    <div className="flex items-center gap-2">
                        <Thermometer size={16} className="text-sunset-orange" />
                        <span>Feel: {Math.round(weather.main.feels_like || weather.main.temp)}°C</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Droplets size={16} className="text-blue-300" />
                        <span>Humidity: {weather.main.humidity}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Wind size={16} className="text-gray-300" />
                        <span>Wind: {weather.wind.speed} m/s</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="capitalize italic opacity-90">{weather.weather[0].description}</div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Weather;
