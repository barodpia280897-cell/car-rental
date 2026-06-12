/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-dark": "#0A0A0A",
        "sidebar-dark": "#111111",
        "card": "rgba(26, 26, 26, 0.75)",
        primary: "#D4AF37",
        accent: "#F3E5AB",
        highlight: "#FFFFFF",
        text: "#E5E7EB",
        success: "#10B981",
        danger: "#EF4444",
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
      },
      boxShadow: {
        glass: "0 4px 30px rgba(0, 0, 0, 0.5)",
        "glow-primary": "0 0 20px rgba(212, 175, 55, 0.3), inset 0 0 10px rgba(212, 175, 55, 0.1)",
        "glow-accent": "0 0 20px rgba(243, 229, 171, 0.2), inset 0 0 10px rgba(243, 229, 171, 0.05)",
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
};
