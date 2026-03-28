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
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        premium: "0 24px 80px rgba(17, 17, 17, 0.08)",
        glow: "0 0 0 1px rgba(17, 17, 17, 0.08), 0 20px 55px rgba(17, 17, 17, 0.1)",
        card: "0 18px 48px rgba(23, 20, 17, 0.08)",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, rgba(17, 17, 17, 0.98), rgba(44, 44, 44, 0.94))",
        "hero-grid":
          "radial-gradient(circle at top, rgba(17, 17, 17, 0.08), transparent 28%), radial-gradient(circle at bottom right, rgba(200, 139, 74, 0.08), transparent 24%)",
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
