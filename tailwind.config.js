/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: {
          primary: {
            DEFAULT: "#f7eeff",
            dark: "#0e0915",
          },

          secondary: {
            DEFAULT: "#ffffff",
            dark: "#1d1529",
          },
        },

        border: {
          DEFAULT: "#edd1ff",
          dark: "#3b295a",
        },

        accent: {
          DEFAULT: "#2ae4b2",
        },
      },
    },
  },
  plugins: [],
};
