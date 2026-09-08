/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        palette: {
          DEFAULT: '#7f77dd',
          dark: '#534ab7',
          soft: '#f3f1fb',
        },
        youtube: '#FF0000',
        facebook: '#1877F2',
        instagram: '#E4405F',
        tiktok: '#000000',
        telegram: '#0088cc',
      },
    },
  },
  plugins: [],
};
