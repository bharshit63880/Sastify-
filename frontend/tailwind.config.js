/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        primary: "#111111",
        secondary: "#1A2230",
        accent: "#C88B4A",
        background: "#090D14",
        card: "#0F1623",
        border: "#202A3A",
        textPrimary: "#F7F9FC",
        textSecondary: "#9AA7BA",
        surface: "#101A2A",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        premium: "0 35px 100px rgba(0, 0, 0, 0.38)",
        glow: "0 0 0 1px rgba(200, 139, 74, 0.18), 0 28px 80px rgba(8, 14, 28, 0.5)",
        card: "0 24px 80px rgba(5, 9, 18, 0.44)",
        glass: "0 22px 70px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255,255,255,0.08)",
        "glow-accent": "0 18px 44px rgba(200, 139, 74, 0.22)",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, rgba(200, 139, 74, 0.98), rgba(116, 82, 38, 0.88))",
        "hero-grid":
          "radial-gradient(circle at top, rgba(28, 39, 61, 0.55), transparent 34%), radial-gradient(circle at bottom right, rgba(200, 139, 74, 0.14), transparent 28%)",
        "glass-gradient":
          "linear-gradient(135deg, rgba(21,28,41,0.9), rgba(13,18,29,0.62))",
        "button-gradient":
          "linear-gradient(135deg, rgba(200,139,74,1), rgba(105,74,35,0.92))",
      },
      animation: {
        float: "float 8s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
