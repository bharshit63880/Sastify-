/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        primary: "#111111",
        secondary: "#EEE7DD",
        accent: "#A07C53",
        background: "#F6F2EB",
        card: "#FFFFFF",
        border: "#E6DED2",
        textPrimary: "#111111",
        textSecondary: "#6E675F",
        surface: "#FBF8F2",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        premium: "0 30px 80px rgba(17, 17, 17, 0.08)",
        glow: "0 0 0 1px rgba(160, 124, 83, 0.08), 0 24px 60px rgba(17, 17, 17, 0.08)",
        card: "0 14px 40px rgba(17, 17, 17, 0.06)",
        glass: "0 14px 34px rgba(17, 17, 17, 0.05)",
        "glow-accent": "0 14px 38px rgba(160, 124, 83, 0.14)",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, rgba(160, 124, 83, 1), rgba(193, 166, 132, 0.85))",
        "hero-grid":
          "radial-gradient(circle at top, rgba(255,255,255,0.82), transparent 38%), radial-gradient(circle at bottom right, rgba(160,124,83,0.12), transparent 28%)",
        "glass-gradient":
          "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(251,248,242,0.96))",
        "button-gradient":
          "linear-gradient(135deg, rgba(17,17,17,1), rgba(45,45,45,0.96))",
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
