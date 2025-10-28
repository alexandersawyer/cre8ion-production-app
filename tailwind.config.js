/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cre8ion: {
          green: '#A6CE39',
          blue: '#009FE3',
          'dark-bg': '#011E2A',
          pink: '#EC008C',
          'light-gray': '#849DA9',
          'dark-blue': '#144678',
        }
      }
    },
  },
  plugins: [],
}