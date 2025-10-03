export const theme = {
  colors: {
    background: "#0b0d12",
    panel: "#131722",
    panelRaised: "#171c29",
    surface: "#1b2130",
    textPrimary: "#e8ebf2",
    textSecondary: "#9aa3b2",
    text: "#e8ebf2",
    accent: "#ff7a45",
    accentAlt: "#21c7be",
    primary: "#21c7be",
    success: "#3cff7c",
    warning: "#ffd23f",
    danger: "#ff5d73",
    gridLine: "#232a36",
    border: "#232a36",
    pad: "#1b2130",
    padActive: "#2d3a5a",
    padLoaded: "#232c43",
    step: "#232a36",
    stepActive: "#4577ff",
    stepAccentBeat: "#7f4bb6",
    beatLight: "#323845",
    beatLightAccent: "#54607a",
  },
  radii: {
    sm: "6px",
    md: "10px",
    lg: "14px",
    pill: "999px",
  },
  shadows: {
    soft: "0 10px 24px rgba(0,0,0,0.45)",
    inset: "inset 0 2px 10px rgba(0,0,0,0.5)",
  },
  spacing: (n: number) => `${n * 8}px`,
  typography: {
    family: `'Inter', system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"`,
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
} as const;

export type AppTheme = typeof theme;
