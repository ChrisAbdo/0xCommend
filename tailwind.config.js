module.exports = {
  content: ["src/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
  theme: {
    extend: {
    
    },
  },
  plugins: [require('@tailwindcss/forms'),require("tailwindcss-animate")],
}