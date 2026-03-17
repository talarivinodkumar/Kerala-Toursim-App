const Gallery = ({ images }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
            {images.map((img, index) => (
                <div key={index} className="overflow-hidden rounded-lg shadow-md group">
                    <img
                        src={img}
                        alt={`Gallery ${index}`}
                        className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                </div>
            ))}
        </div>
    );
};

export default Gallery;
