/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    primary: '#6366f1',   // Indigo
                    secondary: '#a855f7', // Purple
                    accent: '#ec4899',    // Pink
                    blue: '#3b82f6',
                    bg: '#f8f8ff',
                    dark: '#0F172A',
                    glass: 'rgba(255,255,255,0.72)',
                }
            },
            fontFamily: {
                sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
            },
            borderRadius: {
                '4xl': '2rem',
                '5xl': '2.5rem',
            },
            transitionDuration: {
                '350': '350ms',
                '400': '400ms',
                '600': '600ms',
                '800': '800ms',
            },
            animation: {
                'blob': 'blob 8s infinite ease-in-out',
                'float': 'float 6s ease-in-out infinite',
                'float-slow': 'float 9s ease-in-out infinite',
                'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
                'scale-in': 'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
                'slide-up': 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both',
                'spin-slow': 'spin 20s linear infinite',
                'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
                'shimmer': 'shimmerMove 2s linear infinite',
            },
            keyframes: {
                blob: {
                    '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.12)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                    '33%': { transform: 'translateY(-12px) rotate(1deg)' },
                    '66%': { transform: 'translateY(-6px) rotate(-0.5deg)' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scaleIn: {
                    from: { opacity: '0', transform: 'scale(0.88)' },
                    to: { opacity: '1', transform: 'scale(1)' },
                },
                slideUp: {
                    from: { opacity: '0', transform: 'translateY(20px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                pulseSoft: {
                    '0%, 100%': { opacity: '1', transform: 'scale(1)' },
                    '50%': { opacity: '0.85', transform: 'scale(0.98)' },
                },
                shimmerMove: {
                    '0%': { backgroundPosition: '-200% center' },
                    '100%': { backgroundPosition: '200% center' },
                },
            }
        },
    },
    plugins: [],
}
