import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#67723a",
      light: "#879356",
      dark: "#4d5825",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#c1a785",
      light: "#e2d4c0",
      dark: "#9f8461",
      contrastText: "#2f2a22",
    },
    background: {
      default: "#f3eee2",
      paper: "#fbf8f1",
    },
    text: {
      primary: "#2f3224",
      secondary: "#66624f",
    },
    divider: "#ddd2bf",
    success: {
      main: "#556b2f",
    },
    error: {
      main: "#b55239",
    },
    warning: {
      main: "#a6762c",
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: "Manrope, 'Segoe UI', sans-serif",
    h1: {
      fontWeight: 800,
      fontSize: "3.4rem",
      lineHeight: 1.1,
    },
    h2: {
      fontWeight: 800,
      fontSize: "2.4rem",
      lineHeight: 1.15,
    },
    h3: {
      fontWeight: 800,
      fontSize: "1.75rem",
      lineHeight: 1.2,
    },
    h4: {
      fontWeight: 800,
      fontSize: "1.35rem",
      lineHeight: 1.25,
    },
    h5: {
      fontWeight: 700,
      fontSize: "1.1rem",
    },
    h6: {
      fontWeight: 700,
      fontSize: "1rem",
    },
    body1: {
      fontSize: "0.98rem",
      lineHeight: 1.65,
    },
    body2: {
      fontSize: "0.9rem",
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 700,
      textTransform: "none",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          backgroundColor: "#f3eee2",
          color: "#2f3224",
        },
        a: {
          color: "inherit",
          textDecoration: "none",
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          border: "1px solid #e1d7c8",
          boxShadow: "0 18px 42px rgba(81, 72, 50, 0.08)",
          backgroundImage: "none",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          paddingInline: 18,
          minHeight: 42,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: "1px solid #e1d7c8",
          boxShadow: "0 18px 42px rgba(81, 72, 50, 0.08)",
        },
      },
    },
  },
});

export default theme;
