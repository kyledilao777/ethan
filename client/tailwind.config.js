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
    },
  },
  plugins: [],
}