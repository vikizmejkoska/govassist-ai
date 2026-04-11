import { createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3B68F5',
      dark: '#203D9E',
      light: '#87A8FF',
      contrastText: '#F8FAFF',
    },
    secondary: {
      main: '#7F71F8',
    },
    success: {
      main: '#56C788',
    },
    warning: {
      main: '#EDC941',
    },
    error: {
      main: '#F16D6D',
    },
    info: {
      main: '#5D89FF',
    },
    text: {
      primary: '#131A2F',
      secondary: '#6C738A',
    },
    background: {
      default: '#EFF4FB',
      paper: '#FFFFFF',
    },
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily: '"Poppins", "Inter", "Segoe UI", sans-serif',
    h1: {
      fontSize: '3.7rem',
      fontWeight: 700,
      lineHeight: 0.98,
      letterSpacing: '-0.05em',
    },
    h2: {
      fontSize: '2.6rem',
      fontWeight: 700,
      lineHeight: 1.08,
      letterSpacing: '-0.04em',
    },
    h3: {
      fontSize: '1.6rem',
      fontWeight: 700,
      letterSpacing: '-0.03em',
    },
    h4: {
      fontSize: '1.15rem',
      fontWeight: 700,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          minHeight: 46,
          paddingInline: 20,
          boxShadow: 'none',
          fontWeight: 700,
          letterSpacing: '-0.01em',
        },
        containedPrimary: {
          backgroundImage: 'linear-gradient(135deg, #4D7BFF 0%, #3E69F2 58%, #3459DB 100%)',
          boxShadow: '0 16px 28px rgba(57, 97, 230, 0.24)',
          '&:hover': {
            backgroundImage: 'linear-gradient(135deg, #567fff 0%, #3d66ec 58%, #2c52d4 100%)',
            boxShadow: '0 18px 34px rgba(49, 84, 202, 0.28)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: '1px solid rgba(228, 234, 245, 0.94)',
          boxShadow: '0 18px 44px rgba(16, 27, 68, 0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 20,
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
          backgroundColor: 'rgba(255, 255, 255, 0.94)',
          borderRadius: 16,
          boxShadow: '0 10px 26px rgba(30, 52, 128, 0.05)',
          transition: 'box-shadow 160ms ease, transform 160ms ease',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(214, 223, 239, 0.92)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(95, 126, 230, 0.36)',
          },
          '&.Mui-focused': {
            boxShadow: '0 0 0 4px rgba(76, 115, 245, 0.1), 0 16px 34px rgba(59, 92, 201, 0.08)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#5F7EE6',
            borderWidth: '1px',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#7e8599',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 600,
        },
      },
    },
  },
});
