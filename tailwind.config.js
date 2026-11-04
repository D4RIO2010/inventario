/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        yamaha: {
          blue: {
            DEFAULT: '#003399',
            light: '#2563eb',
            dark: '#002266',
            hover: '#002b80',
          },
          red: {
            DEFAULT: '#e60012',
            light: '#ef4444',
            dark: '#b3000e',
            hover: '#cc0010',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
