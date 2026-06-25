/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2E7D32',
        'primary-dark': '#1B5E20',
        'primary-container': '#E8F5E9',
        'primary-light': '#C8E6C9',
        'surface-soft': '#F5F7FA',
        'text-secondary': '#666666',
        'error-red': '#B00020',
        'error-container': '#FDECEA',
      },
    },
  },
  plugins: [],
}
