export const colors = {
    background: '#0C111C',       // Dark premium background
    surface: '#1E293B',          // Card/surface background
    surfaceLight: '#334155',     // Lighter surface for hover/active states
    primary: '#7C3AED',          // Main accent (Violet)
    secondary: '#A78BFA',        // Lighter accent
    text: '#F8FAFC',             // Primary text
    textMuted: '#94A3B8',        // Secondary text
    danger: '#EF4444',           // Error state
    success: '#10B981',          // Success state
    transparent: 'transparent',
};

export const typography = {
    fontFamily: {
        regular: 'Inter_400Regular',
        medium: 'Inter_500Medium',
        semiBold: 'Inter_600SemiBold',
        bold: 'Inter_700Bold',
    },
    fontSize: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
        xxl: 24,
        huge: 32,
    },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const radius = {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
};

export default { colors, typography, spacing, radius };
