/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#2563EB', // Blue 600
                secondary: '#F3F4F6', // Gray 100
            }
        },
    },
    plugins: [],
}
