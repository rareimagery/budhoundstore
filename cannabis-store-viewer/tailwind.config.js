/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green:  "#6D4C41",
          light:  "#EFEBE9",
          dark:   "#3E2723",
          gold:   "#8D6E63",
          cream:  "#F7F2EB",
        },
      },
      fontFamily: {
        sans: ["'Nunito Sans'", "'Inter'", "system-ui", "sans-serif"],
        serif: ["'Playfair Display'", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
