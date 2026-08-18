/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FBFAF6',
          100: '#F7F5F0',
          200: '#EFEBE0',
          300: '#E2DCC9',
        },
        forest: {
          50: '#E8F0EA',
          100: '#C9DDD0',
          200: '#93B69E',
          300: '#5E8E6C',
          400: '#3B6E4B',
          500: '#2A5238',
          600: '#1F3F2A',
          700: '#163021',
          800: '#0F2016',
        },
        amber: {
          50: '#FDF3E3',
          100: '#FAE5BF',
          200: '#F4C97A',
          300: '#EBA84A',
          400: '#D98A2B',
          500: '#B96D1A',
          600: '#925316',
        },
        coral: {
          400: '#E8765A',
          500: '#D85A3E',
        },
        charcoal: {
          700: '#3A3530',
          800: '#2A2622',
          900: '#1C1A17',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 18s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'marquee': 'marquee 32s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};
