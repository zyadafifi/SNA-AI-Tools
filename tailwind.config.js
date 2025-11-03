/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        fadeInOut: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "20%": { opacity: "1", transform: "scale(1)" },
          "80%": { opacity: "1", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(0.9)" },
        },
      },
      animation: {
        "fade-in-out": "fadeInOut 3s ease-in-out",
      },
    },
  },
  plugins: [require("daisyui")],
};
