/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'co-green': '#00A651',
        'co-green-dark': '#008C45',
        'co-bg': '#F5F5F0',
        'co-muted': '#6B7280',
      },
      fontFamily: {
        display: ['"Financier Display"', 'Georgia', 'serif'],
        body: ['Graphik', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
