import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#4f46e5",
        "primary-dark": "#3730a3",
        "primary-light": "#ede9fe",
        "primary-subtle": "#f0f4ff",
        surface: "#f8fafc",
        muted: "#64748b",
        done: "#22c55e",
        "done-light": "#dcfce7",
        "done-subtle": "#f0fdf4",
        skipped: "#94a3b8",
        not_sure: "#f59e0b",
        "warning-subtle": "#fffbeb",
        pending: "#e2e8f0",
        danger: "#ef4444",
        "danger-subtle": "#fef2f2",
        "card-border": "#e7eaf3",
      },
    },
  },
  plugins: [],
};
export default config;
