import { createTheme } from '@mui/material/styles';

const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
} as const;

const shadow = {
  xs: '0 1px 2px rgba(15, 24, 59, 0.06)',
  sm: '0 4px 12px rgba(15, 24, 59, 0.06), 0 1px 2px rgba(15, 24, 59, 0.04)',
  md: '0 12px 28px rgba(15, 24, 59, 0.08), 0 2px 6px rgba(15, 24, 59, 0.04)',
  lg: '0 22px 48px rgba(15, 24, 59, 0.12), 0 6px 16px rgba(15, 24, 59, 0.06)',
  xl: '0 36px 72px rgba(15, 24, 59, 0.16), 0 10px 24px rgba(15, 24, 59, 0.08)',
} as const;

const ink = {
  900: '#0F1730',
  800: '#131A2F',
  700: '#2A3350',
  600: '#4A5275',
  500: '#6C738A',
  400: '#8C93A8',
  300: '#B5BBCB',
  200: '#D9DEEA',
  100: '#E8ECF5',
  50: '#F3F5FB',
} as const;

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3B68F5',
      dark: '#1F47C7',
      light: '#7E9DFF',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#7F71F8',
      dark: '#5C4FE0',
      light: '#A799FF',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#2FA86A',
      light: '#E3F6EC',
      dark: '#1F7A4D',
    },
    warning: {
      main: '#D9A41E',
      light: '#FBF1D6',
      dark: '#9C7510',
    },
    error: {
      main: '#E04E4E',
      light: '#FBE2E2',
      dark: '#A23030',
    },
    info: {
      main: '#3B68F5',
      light: '#E2EAFE',
      dark: '#1F47C7',
    },
    text: {
      primary: ink[800],
      secondary: ink[500],
      disabled: ink[400],
    },
    divider: 'rgba(15, 24, 59, 0.08)',
    background: {
      default: '#EFF3FB',
      paper: '#FFFFFF',
    },
    grey: {
      50: ink[50],
      100: ink[100],
      200: ink[200],
      300: ink[300],
      400: ink[400],
      500: ink[500],
      600: ink[600],
      700: ink[700],
      800: ink[800],
      900: ink[900],
    },
  },
  shape: {
    borderRadius: radius.lg,
  },
  typography: {
    fontFamily: '"Poppins", "Inter", "Segoe UI", sans-serif',
    h1: {
      fontSize: '3.2rem',
      fontWeight: 700,
      lineHeight: 1.02,
      letterSpacing: '-0.04em',
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.1,
      letterSpacing: '-0.035em',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
    },
    h4: {
      fontSize: '1.1rem',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.015em',
    },
    subtitle1: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    body1: {
      lineHeight: 1.6,
    },
    body2: {
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '-0.005em',
    },
    caption: {
      letterSpacing: '0.01em',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFeatureSettings: '"ss01", "cv11"',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: radius.md,
          minHeight: 44,
          paddingInline: 18,
          boxShadow: 'none',
          fontWeight: 600,
          letterSpacing: '-0.005em',
          transition: 'background-color 160ms ease, box-shadow 200ms ease, transform 160ms ease, border-color 160ms ease',
        },
        sizeLarge: {
          minHeight: 50,
          paddingInline: 22,
          fontSize: '1rem',
        },
        sizeSmall: {
          minHeight: 36,
          paddingInline: 14,
        },
        containedPrimary: {
          backgroundImage: 'linear-gradient(135deg, #4D7BFF 0%, #3E69F2 58%, #2F55D8 100%)',
          boxShadow: `${shadow.md}, inset 0 1px 0 rgba(255, 255, 255, 0.18)`,
          '&:hover': {
            backgroundImage: 'linear-gradient(135deg, #5786ff 0%, #3a64ec 58%, #2849c2 100%)',
            boxShadow: `${shadow.lg}, inset 0 1px 0 rgba(255, 255, 255, 0.22)`,
          },
          '&:active': {
            transform: 'translateY(1px)',
          },
          '&.Mui-disabled': {
            backgroundImage: 'none',
            backgroundColor: ink[200],
            color: ink[400],
            boxShadow: 'none',
          },
        },
        outlined: {
          borderColor: ink[200],
          backgroundColor: '#FFFFFF',
          color: ink[700],
          '&:hover': {
            borderColor: 'rgba(59, 104, 245, 0.4)',
            backgroundColor: 'rgba(59, 104, 245, 0.04)',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(59, 104, 245, 0.06)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: radius.lg,
          border: `1px solid ${ink[100]}`,
          boxShadow: shadow.sm,
          transition: 'box-shadow 200ms ease, transform 200ms ease, border-color 200ms ease',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: radius.lg,
        },
        outlined: {
          borderColor: ink[100],
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true,
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderRadius: radius.md,
          boxShadow: shadow.xs,
          transition: 'box-shadow 160ms ease, border-color 160ms ease',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: ink[200],
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(59, 104, 245, 0.45)',
          },
          '&.Mui-focused': {
            boxShadow: '0 0 0 3px rgba(59, 104, 245, 0.16), 0 6px 16px rgba(59, 104, 245, 0.08)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#3B68F5',
            borderWidth: '1px',
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: '#E04E4E',
          },
        },
        input: {
          paddingBlock: 14,
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: ink[500],
          '&.Mui-focused': {
            color: '#1F47C7',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 600,
          letterSpacing: '-0.005em',
          height: 26,
        },
        sizeSmall: {
          height: 24,
          fontSize: '0.74rem',
        },
        outlined: {
          borderColor: ink[200],
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 40,
        },
        indicator: {
          height: 3,
          borderRadius: 999,
          backgroundColor: '#3B68F5',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 40,
          textTransform: 'none',
          fontWeight: 600,
          letterSpacing: '-0.005em',
          color: ink[500],
          '&.Mui-selected': {
            color: ink[800],
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: ink[800],
          fontSize: '0.78rem',
          fontWeight: 500,
          padding: '8px 10px',
          borderRadius: radius.sm,
          boxShadow: shadow.md,
        },
        arrow: {
          color: ink[800],
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: radius.md,
          border: `1px solid ${ink[100]}`,
          boxShadow: shadow.lg,
          marginTop: 6,
          padding: 4,
        },
        list: {
          padding: 0,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: radius.sm,
          padding: '10px 12px',
          gap: 8,
          '&:hover': {
            backgroundColor: 'rgba(59, 104, 245, 0.06)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(59, 104, 245, 0.1)',
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(15, 24, 59, 0.08)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            color: ink[500],
            fontSize: '0.74rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            borderBottom: `1px solid ${ink[100]}`,
            backgroundColor: 'transparent',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${ink[100]}`,
          paddingBlock: 14,
          fontSize: '0.92rem',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(59, 104, 245, 0.04)',
          },
          '&:last-of-type .MuiTableCell-root': {
            borderBottom: 'none',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: radius.md,
          border: '1px solid transparent',
          fontSize: '0.92rem',
        },
        standardError: {
          backgroundColor: '#FBE2E2',
          color: '#A23030',
          borderColor: 'rgba(224, 78, 78, 0.18)',
        },
        standardSuccess: {
          backgroundColor: '#E3F6EC',
          color: '#1F7A4D',
          borderColor: 'rgba(47, 168, 106, 0.18)',
        },
        standardWarning: {
          backgroundColor: '#FBF1D6',
          color: '#9C7510',
          borderColor: 'rgba(217, 164, 30, 0.22)',
        },
        standardInfo: {
          backgroundColor: '#E2EAFE',
          color: '#1F47C7',
          borderColor: 'rgba(59, 104, 245, 0.18)',
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: ink[300],
          '&.Mui-checked': {
            color: '#3B68F5',
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          letterSpacing: '-0.01em',
        },
      },
    },
  },
});
