/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        primary: "#111111",
        secondary: "#D7CEC2",
        accent: "#C88B4A",
        background: "#F4EFE8",
        card: "#FFFFFF",
        border: "#E7DFD5",
        textPrimary: "#111111",
        textSecondary: "#7B736A",
        surface: "#FFFDF9",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        premium: "0 24px 80px rgba(17, 17, 17, 0.08)",
        glow: "0 0 0 1px rgba(17, 17, 17, 0.08), 0 20px 55px rgba(17, 17, 17, 0.1)",
        card: "0 18px 48px rgba(23, 20, 17, 0.08)",
        glass: "0 18px 50px rgba(18, 18, 18, 0.08), inset 0 1px 0 rgba(255,255,255,0.7)",
        "glow-accent": "0 18px 44px rgba(200, 139, 74, 0.18)",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, rgba(17, 17, 17, 0.98), rgba(44, 44, 44, 0.94))",
        "hero-grid":
          "radial-gradient(circle at top, rgba(17, 17, 17, 0.08), transparent 28%), radial-gradient(circle at bottom right, rgba(200, 139, 74, 0.08), transparent 24%)",
        "glass-gradient":
          "linear-gradient(135deg, rgba(255,255,255,0.82), rgba(255,255,255,0.42))",
        "button-gradient":
          "linear-gradient(135deg, rgba(17,17,17,1), rgba(72,72,72,0.94))",
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
