/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF9619',
          light: '#FAC39B',
        },
        blue: {
          DEFAULT: '#91B9B4',
          light: '#C4D9D6',
          dark: '#658F8A',
        },
        beige: {
          DEFAULT: '#FAC39B',
          light: '#FDDDC8',
          dark: '#E8A873',
        },
        orange: {
          DEFAULT: '#FF9619',
          light: '#FFBC66',
          dark: '#CC7814',
        },
        sunset: {
          DEFAULT: '#EB5A3C',
          light: '#F29580',
          dark: '#C04830',
        },
        red: {
          DEFAULT: '#B41932',
          light: '#D65970',
          dark: '#8A1327',
        },
        purple: {
          DEFAULT: '#6E1946',
          light: '#9B6B8A',
          dark: '#4D1131',
        },
        dark: {
          DEFAULT: '#0F2837',
          light: '#1A3A4D',
          lighter: '#2A4A5D',
        },
      },
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      spacing: {
        '18': '4.5rem',
        '112': '28rem',
        '128': '32rem',
        '144': '36rem',
      },
      fontSize: {
        'xxs': '0.625rem',
        'tiny': '0.75rem',
      },
      animation: {
        'fade-in': 'fade-in 1s ease-out forwards',
        'slide-up': 'slide-up 0.6s ease-out forwards',
        'slide-up-delay-1': 'slide-up 0.6s ease-out 0.2s forwards',
        'slide-up-delay-2': 'slide-up 0.6s ease-out 0.4s forwards',
        'slide-up-delay-3': 'slide-up 0.6s ease-out 0.6s forwards',
        'float': 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-soft': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
    },
  },
  plugins: [],
};