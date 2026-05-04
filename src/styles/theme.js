export const theme = {
  colors: {
    background: '#f5f1ea',
    surface: '#ffffff',
    surfaceWarm: '#faf6ed',
    border: '#ebe4d6',
    borderSoft: '#f0e9da',
    ink: '#3c3223',
    inkMuted: '#7a6f5c',
    inkSubtle: '#a89e8a',
    accent: '#a08968',
    accentWarm: '#c4956c',
    positive: '#7a9b76',
    negative: '#c97064',
    categories: {
      Housing: '#d4a574',
      Food: '#c97064',
      Shopping: '#8b9d83',
      Transport: '#6b8e9e',
      Health: '#b08bbb',
      Income: '#7a9b76',
      Bills: '#c4956c',
      Transfer: '#9aa5af',
      Other: '#9a9a9a',
    },
  },
  fonts: {
    display: '"Fraunces Variable", Fraunces, Georgia, serif',
    body: '"Inter Variable", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  radius: {
    small: 8,
    medium: 12,
    large: 20,
    pill: 999,
  },
  space: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  shadow: {
    soft: '0 1px 2px rgba(60, 50, 35, 0.04), 0 4px 16px rgba(60, 50, 35, 0.04)',
    lift: '0 2px 6px rgba(60, 50, 35, 0.06), 0 12px 32px rgba(60, 50, 35, 0.08)',
  },
};

export const cssVars = `
  :root {
    --bg: ${theme.colors.background};
    --surface: ${theme.colors.surface};
    --surface-warm: ${theme.colors.surfaceWarm};
    --border: ${theme.colors.border};
    --border-soft: ${theme.colors.borderSoft};
    --ink: ${theme.colors.ink};
    --ink-muted: ${theme.colors.inkMuted};
    --ink-subtle: ${theme.colors.inkSubtle};
    --accent: ${theme.colors.accent};
    --accent-warm: ${theme.colors.accentWarm};
    --positive: ${theme.colors.positive};
    --negative: ${theme.colors.negative};

    --font-display: ${theme.fonts.display};
    --font-body: ${theme.fonts.body};

    --radius-sm: ${theme.radius.small}px;
    --radius-md: ${theme.radius.medium}px;
    --radius-lg: ${theme.radius.large}px;
    --radius-pill: ${theme.radius.pill}px;

    --shadow-soft: ${theme.shadow.soft};
    --shadow-lift: ${theme.shadow.lift};

    --safe-top: env(safe-area-inset-top, 0px);
    --safe-bottom: env(safe-area-inset-bottom, 0px);
  }
`;

export const categoryColor = (name) =>
  theme.colors.categories[name] || theme.colors.categories.Other;
