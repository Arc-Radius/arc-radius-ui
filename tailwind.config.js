/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,tsx}',
    './App.{js,ts,tsx}',
    './components/**/*.{js,ts,tsx}',
    './constants/**/*.{js,ts,tsx}',
  ],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        arc: {
          green: '#008026',
          ink: '#1A1814',
          blue: '#24408E',
          bark: '#2C2820',
          charcoal: '#2D3436',
          slate: '#4A4640',
          purple: '#732982',
          drift: '#7A756E',
          sand: '#D8D4CC',
          red: '#E40303',
          linen: '#F0EDE8',
          cream: '#F5F4F0',
          orange: '#FF8C00',
          yellow: '#FFED00',
        },
      },
      fontFamily: {
        serif: ['LibreBaskerville_400Regular', 'Libre Baskerville', 'serif'],
        'serif-bold': ['LibreBaskerville_700Bold', 'Libre Baskerville', 'serif'],
        sans: ['IBMPlexSans_400Regular', 'IBM Plex Sans', 'sans-serif'],
        'sans-medium': ['IBMPlexSans_500Medium', 'IBM Plex Sans', 'sans-serif'],
        'sans-semibold': ['IBMPlexSans_600SemiBold', 'IBM Plex Sans', 'sans-serif'],
        'sans-bold': ['IBMPlexSans_700Bold', 'IBM Plex Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
