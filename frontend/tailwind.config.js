/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: '#ffffff',
        background: '#f8f9fa',
        textMain: '#111111',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0,0,0,0.05)',
        'float': '0 20px 40px -10px rgba(0,0,0,0.08)',
        'card': '0 2px 10px rgba(0,0,0,0.02)',
      },

      // ✅ ADD THIS
      fontFamily: {
        vast: ['"Vast Shadow"', 'cursive'],
      },
    },
  },
  plugins: [],
}