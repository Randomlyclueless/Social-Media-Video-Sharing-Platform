export const colors = {
  primary: '#8B5CF6',
  primaryDark: '#7C3AED',
  primaryLight: '#A78BFA',
  secondary: '#EC4899',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  dark: {
    900: '#0B1120',
    800: '#111827',
    700: '#1F2937',
    600: '#374151',
    500: '#4B5563',
  },
  light: {
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
  },
  white: '#FFFFFF',
  black: '#000000',
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  neon: '0 0 20px rgba(139, 92, 246, 0.3)',
};

export const animations = {
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `,
  pulse: `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `,
  spin: `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `,
};