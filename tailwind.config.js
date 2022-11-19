/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./frontend/src/**.{html, js}",
            "./frontend/src/main.js",
            "./frontend/src/cart.js"
          ],
  theme: {
    extend: {
      animation: {
        popup: "popup .45s ease-in-out",
        fadein: "fadein .45s ease-in-out",
        slideout: "slideout .45s ease-in-out"
      },
      keyframes: {
        popup: {
          "0%": { transform: "scale(0)" },
          "75%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)" },
        },
        fadein: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        slideout: {
          "0%": {
            opacity: "1",
            transform: "translate-x-0"
          },
          "100%": { 
            opacity: "0",
            transform: "-translate-x-12"
          } 
        }
      }
    },
    fontFamily: {
      sans: ["Roboto", "sans-serif"]
    }
  },
  plugins: [],
}
