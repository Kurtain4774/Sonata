/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        spotify: "#1DB954",
        "spotify-dark": "#191414",
      },
    },
  },
  plugins: [],
};
