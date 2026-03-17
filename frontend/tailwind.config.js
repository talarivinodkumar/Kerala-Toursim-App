/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'romantic-pink': '#FFC0CB',
                'sunset-orange': '#FF7F50',
                'deep-blue': '#1E90FF',
            },
            fontFamily: {
                'cursive': ['Dancing Script', 'cursive'],
                'sans': ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
