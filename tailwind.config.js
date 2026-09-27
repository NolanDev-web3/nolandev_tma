/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "section-bg-color": "var(--tg-theme-section-bg-color)",
        "defi-bg-base": "#0f172a",
        "defi-card-bg": "#1e293b",
        "defi-accent-blue": "#3b82f6",
        "defi-accent-purple": "#8b5cf6",
        "defi-text-muted": "#94a3b8",
      },
    },
  },
  plugins: [],
};
