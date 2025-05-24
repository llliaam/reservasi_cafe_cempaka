// tailwind.config.js
const {heroui} = require("@heroui/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./node_modules/@heroui/theme/dist/components/navbar.js",
    "./resources/**/*.{js,jsx,ts,tsx,blade.php}",
  ],
  theme: {
    extend: {
      keyframes: {
        slideDown: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        }
    },
    animation: {
        slideDown: 'slideDown 0.3s ease-in-out forwards',
      }
    },

  },
  darkMode: "class",
  plugins: [heroui()],
};