/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        mono: ['"Courier Prime"', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
};
