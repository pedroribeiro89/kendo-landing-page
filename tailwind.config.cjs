const plugin = require('tailwindcss/plugin')
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kendo-red': '#EB1241',
        'kendo-yellow': '#F9F871',
        'kendo-orange': '#FAB35F',
        'kendo-lightblue': '#006daa',
        'kendo-gray': '#b9d6f2',
        'kendoblue': {
          "50": "#E4E2EE",
          "100": "#C9C6DC",
          "200": "#9690BC",
          "300": "#625A95",
          "400": "#3F3A5F",
          "500": "#191726",
          "600": "#151320",
          "700": "#0F0D16",
          "800": "#0A0A10",
          "900": "#040406"
        },
        fontFamily: {
          'inter': ['Inter', 'sans-serif'],
          'ubuntu': ['Ubuntu', 'sans-serif']
        }
      },
      container: {
        center: true,
        padding: '1rem',
        screen: {
          lg: '1124px',
          xl: '1124px',
          '2xl': '1224px'

        }
      }
    },
    plugins: [],
  }
}
