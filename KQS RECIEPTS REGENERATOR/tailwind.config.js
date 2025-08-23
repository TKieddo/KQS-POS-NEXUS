/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        kqsRed: "#C1272D", // KQS red color from the logo
        kqsBlack: "#231F20", // KQS black color from the logo
      },
    },
  },
  plugins: [],
}; 