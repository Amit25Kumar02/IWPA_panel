/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./index.html",
  ],
  safelist: [
    "hidden",
    "sm:hidden",
    "sm:inline",
  ],
  theme: {
    extend: {
      fontFamily: {
        glacial: ["Glacial Indifference", "sans-serif"],
      },
    },
  },
  plugins: [],
};
