/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,tsx}',
    './App.{js,ts,tsx}',
    './components/**/*.{js,ts,tsx}',
    './static/**/*.{js,ts,tsx}',
  ],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // App background: cool blue-gray for depth; white cards pop against it
        app: { bg: '#f0f2f6' },
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
        sans: ['GreycliffCF_400Regular', 'Greycliff CF', 'sans-serif'],
        'sans-medium': ['GreycliffCF_500Medium', 'Greycliff CF', 'sans-serif'],
        'sans-semibold': ['GreycliffCF_600DemiBold', 'Greycliff CF', 'sans-serif'],
        'sans-bold': ['GreycliffCF_700Bold', 'Greycliff CF', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
