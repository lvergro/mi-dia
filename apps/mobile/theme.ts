export const colors = {
  // Brand
  primary: "#4f46e5",
  primaryDark: "#3730a3",
  primaryLight: "#ede9fe",
  primarySubtle: "#f0f4ff",

  // Backgrounds
  surface: "#f8fafc",
  white: "#ffffff",
  cardBorder: "#e7eaf3",

  // Text
  textPrimary: "#1e293b",
  textSecondary: "#64748b",
  textMuted: "#94a3b8",
  textDisabled: "#cbd5e1",

  // States
  success: "#22c55e",
  successLight: "#dcfce7",
  successSubtle: "#f0fdf4",

  warning: "#f59e0b",
  warningLight: "#fef3c7",
  warningSubtle: "#fffbeb",

  danger: "#ef4444",
  dangerLight: "#fee2e2",
  dangerSubtle: "#fef2f2",

  info: "#3b82f6",
  infoLight: "#dbeafe",
  infoSubtle: "#eff6ff",

  // Mood palette
  mood1: "#ef4444",
  mood2: "#f97316",
  mood3: "#eab308",
  mood4: "#22c55e",
  mood5: "#3b82f6",

  // Neutrals
  gray50: "#f9fafb",
  gray100: "#f1f5f9",
  gray200: "#e2e8f0",
  gray300: "#cbd5e1",
  gray400: "#94a3b8",
  gray500: "#64748b",
  gray600: "#475569",
  gray700: "#334155",
  gray800: "#1e293b",
  gray900: "#0f172a",
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const shadows = {
  card: {
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  subtle: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
} as const;

export const typography = {
  label: { fontSize: 11, fontWeight: "700" as const, letterSpacing: 0.6 },
  caption: { fontSize: 12, fontWeight: "400" as const },
  body: { fontSize: 14, fontWeight: "400" as const },
  bodyMedium: { fontSize: 14, fontWeight: "500" as const },
  bodySemibold: { fontSize: 14, fontWeight: "600" as const },
  subheading: { fontSize: 16, fontWeight: "600" as const },
  heading: { fontSize: 20, fontWeight: "700" as const },
  title: { fontSize: 24, fontWeight: "700" as const },
} as const;
