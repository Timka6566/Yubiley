/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'marck-script': ['Marck_Script', 'cursive'],
        'lobster': ['Lobster', 'cursive'],
        'pacifico': ['Pacifico', 'cursive'],
        'bad-script': ['Bad_Script', 'cursive'],
        'noto-serif': ['Noto_Serif_JP', 'cursive'],
      },
      colors: {
        'gold': '#DAA520',
        'custom-yellow': '#887300',
      } 
    },
  },
  plugins: [],
}
