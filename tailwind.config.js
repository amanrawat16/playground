/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        'loginBg': "url('https://octopus-app-ly3r2.ondigitalocean.app/uploads/ABE05757.png')"
      }
    },
  },
  plugins: [],
};
