export const COLORS = {
  // Deep Cyber Obsidian Backdrops
  background: '#08090C',
  surface: '#111318',
  surfaceSecondary: '#181B22',
  surfaceElevated: '#1F232D',
  border: '#262C3A',
  borderSubtle: '#191E28',
  borderGlow: 'rgba(204, 255, 0, 0.35)',

  // Signature High-Voltage Electric Lime (Astrix Accent)
  primary: '#CCFF00',
  primaryDark: '#A3CC00',
  primaryLight: '#E2FF66',
  primaryGlow: 'rgba(204, 255, 0, 0.25)',
  primarySurface: 'rgba(204, 255, 0, 0.08)',

  // Dynamic Telemetry & Split Highlights
  cyan: '#00F0FF',
  cyanGlow: 'rgba(0, 240, 255, 0.25)',
  cyanSurface: 'rgba(0, 240, 255, 0.08)',

  coral: '#FF3366',
  coralGlow: 'rgba(255, 51, 102, 0.25)',
  coralSurface: 'rgba(255, 51, 102, 0.08)',

  amber: '#FFB800',
  amberGlow: 'rgba(255, 184, 0, 0.25)',

  purple: '#A855F7',
  purpleGlow: 'rgba(168, 85, 247, 0.25)',

  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',

  // High contrast typography
  textPrimary: '#FFFFFF',
  textSecondary: '#A1A8B8',
  textMuted: '#646D82',
  textInverse: '#08090C',

  // Map & Overlay
  mapRouteLine: '#CCFF00',
  mapRouteHalo: 'rgba(204, 255, 0, 0.4)',
  mapBackground: '#0B0D13',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const TYPOGRAPHY = {
  fontFamily: {
    heading: 'System',
    body: 'System',
    mono: 'monospace',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
    display: 40,
    hud: 54,
  },
  lineHeight: {
    xs: 14,
    sm: 18,
    md: 22,
    lg: 26,
    xl: 30,
    xxl: 36,
    display: 46,
    hud: 60,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 1.2,
    ultrawide: 2.5,
  },
};

export const SHADOWS = {
  glowPrimary: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 8,
  },
  glowCyan: {
    shadowColor: COLORS.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
};

