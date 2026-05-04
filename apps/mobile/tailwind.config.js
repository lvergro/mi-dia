/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#4f46e5",
        "primary-dark": "#3730a3",
        surface: "#f8fafc",
        muted: "#64748b",
        done: "#22c55e",
        skipped: "#94a3b8",
        not_sure: "#f59e0b",
        pending: "#e2e8f0",
      },
    },
  },
  plugins: [],
};
