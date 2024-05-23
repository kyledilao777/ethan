/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      screens: {
        xsm: "250px",
        xmd: "768px",
        sxl: "800px",
        xxl: "1400px"
      },

      spacing: {
        '25vh': '25vh',
      },

      colors: {
        lightPurple: '#b39ddb',
        softGray: '#f8f8f8',
        darkGray: '#333333',
        customWhite: '#ffffff',
      },
    },
  },
  plugins: [],
}