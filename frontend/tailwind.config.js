/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        night: '#0b031c',
        deep: '#170838',
        brand: '#3a097f',
        glow: '#8b5cf6',
        orchid: '#d8b4fe',
        magenta: '#f472b6',
      },
      fontFamily: {
        display: ['Unbounded', 'Manrope', 'system-ui', 'sans-serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px -8px rgba(139,92,246,.65)',
        soft: '0 20px 60px -20px rgba(0,0,0,.6)',
      },
      keyframes: {
        orbit: { to: { transform: 'rotate(360deg)' } },
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        pulseRing: { '0%': { transform: 'scale(.8)', opacity: '.7' }, '100%': { transform: 'scale(1.6)', opacity: '0' } },
      },
      animation: {
        orbit: 'orbit 40s linear infinite',
        'orbit-rev': 'orbit 40s linear infinite reverse',
        floaty: 'floaty 6s ease-in-out infinite',
        ring: 'pulseRing 3s ease-out infinite',
      },
    },
  },
  plugins: [],
}
