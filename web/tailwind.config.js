/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",   // <- phải có dòng này
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
