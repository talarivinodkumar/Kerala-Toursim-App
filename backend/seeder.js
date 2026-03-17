const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Place = require('./models/Place');
const Hotel = require('./models/Hotel');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const importData = async () => {
    try {
        await Place.deleteMany();
        await Hotel.deleteMany();

        const places = [
            {
                name: "Cherai Beach",
                location: "Vypin Island, Kochi",
                description: "Known as the Golden Beach of Kerala, Cherai Beach is a picturesque beach located on the northern end of Vypin Island. Ideally located 25 km from Kochi and 30 km from Cochin International Airport, it is a favorite haunt of those looking for a relaxing swim with the backdrop of coconut groves.",
                images: ["https://images.unsplash.com/photo-1590053912644-656df877299a?auto=format&fit=crop&w=800&q=80"]
            },
            {
                name: "Aluva Manappuram",
                location: "Aluva, Kochi",
                description: "A famous temple and river bank on the Periyar River. It is known for the Shivaratri festival and the beautiful footbridge.",
                images: ["https://images.unsplash.com/photo-1629081703652-325514cb8311?auto=format&fit=crop&w=800&q=80"]
            },
            {
                name: "Pallipuram Fort",
                location: "Vypin, near Cherai",
                description: "One of the oldest existing European forts in India, built by the Portuguese in 1503.",
                images: ["https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80"]
            }
        ];

        const hotels = [
            {
                name: "Cherai Beach Resort",
                rating: 4.5,
                priceRange: "$$$",
                images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"]
            },
            {
                name: "Sealine Beach Resort",
                rating: 4.0,
                priceRange: "$$",
                images: ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80"]
            },
            {
                name: "Blue Waters Cherai",
                rating: 4.2,
                priceRange: "$$",
                images: ["https://images.unsplash.com/photo-1571896349842-6e53ce41be03?auto=format&fit=crop&w=800&q=80"]
            }
        ];

        await Place.insertMany(places);
        await Hotel.insertMany(hotels);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
