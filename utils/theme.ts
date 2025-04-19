// Theme configuration for the app
export const theme = {
  colors: {
    primary: '#4158D0',
    secondary: '#C850C0',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
    error: '#FF5252',
    success: '#4CAF50',
    warning: '#FFC107',
    info: '#2196F3',
    card: '#1E1E1E',
    border: '#333333',
    disabled: '#757575',
    placeholder: '#9E9E9E',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    round: 9999,
  },
  typography: {
    fontSizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
    fontWeights: {
      light: '300',
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

// Gradient presets for calculator cards
export const gradients = {
  blue: ['#4158D0', '#C850C0'],
  green: ['#08AEEA', '#2AF598'],
  purple: ['#A9C9FF', '#FFBBEC'],
  orange: ['#FEE140', '#FA709A'],
  pink: ['#FA8BFF', '#2BD2FF'],
  teal: ['#0093E9', '#80D0C7'],
  red: ['#FF9A8B', '#FF6A88'],
  yellow: ['#F6D365', '#FDA085'],
};