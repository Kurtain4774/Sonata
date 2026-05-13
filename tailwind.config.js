/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        spotify: "rgb(var(--accent-rgb) / <alpha-value>)",
        "spotify-dark": "#191414",
      },
      boxShadow: {
        "spotify-glow": "0 0 80px -20px rgb(var(--accent-rgb) / 0.45)",
      },
    },
  },
  plugins: [],
};
