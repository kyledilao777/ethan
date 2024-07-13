/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      keyframes: {
        fadeInOut: {
          '0%, 100%': { opacity: 0 },
          '50%': { opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        animation: {
          fadeIn: 'fadeIn 0.5s ease-in-out forwards',
      },
      },
      animation: {
        fadeInOut: 'fadeInOut 5s ease-in-out infinite',
      },
      screens: {
        xsm: "250px",
        xmd: "768px",
        sxl: "800px",
        xxl: "1400px"
      },

      spacing: {
        '25vh': '25vh',
        '50vh': '50vh',
      },

      colors: {
        lightPurple: '#b39ddb',
        softGray: '#f8f8f8',
        darkGray: '#333333',
        customWhite: '#ffffff',
        blueNav: '#1A5967',
        blackNav: '#273240',
        titleNav: '#082431',
        eventDiv: '#1A73E8',
      },

      fontFamily: {
        'poppins': ['Poppins']
      }
    },
  },
  plugins: [],
}
