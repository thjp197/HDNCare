export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#5f6FFF",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
  ],
}