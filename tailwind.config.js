/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/App.jsx",
    "./src/main.jsx",
    "./src/components/*.{js,jsx}",
    "./src/components/admin/*.{js,jsx}",
    "./src/pages/*.{js,jsx}",
    "./src/hooks/*.{js,jsx}",
    "./src/store/*.{js,jsx}",
    "./src/utils/*.{js,jsx}",
    "./src/i18n/*.{js,jsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
