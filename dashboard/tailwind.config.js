/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        minecraft: {
          green: '#5B8731',
          dark: '#3B5B1F',
          dirt: '#8B6914',
        },
        rhino: {
          blue: '#1E90FF',
          dark: '#0066CC',
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
