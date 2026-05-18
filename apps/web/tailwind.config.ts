import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#4f46e5",
        "primary-dark": "#3730a3",
        "primary-light": "#ede9fe",
        "primary-subtle": "#eef2ff",
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
        "card-border": "#e2e8f0",
        "text-primary": "#1e293b",
        "text-secondary": "#64748b",
        "text-muted": "#94a3b8",
        // Sidebar / dashboard tokens
        sidebar: "#ffffff",
        "sidebar-hover": "#f5f3ff",
        "sidebar-active": "#eef2ff",
        "sidebar-active-text": "#4f46e5",
        "app-bg": "#f1f5f9",
        lavender: "#f5f3ff",
      },
      boxShadow: {
        card: "0 2px 8px rgba(99,102,241,0.07)",
        subtle: "0 1px 3px rgba(0,0,0,0.05)",
        md: "0 4px 16px rgba(99,102,241,0.10)",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
        "4xl": "24px",
      },
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "1rem" }],
      },
    },
  },
  plugins: [],
};
export default config;
