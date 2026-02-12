"use client";

import { createTheme } from "@mui/material/styles";

const shamiri = {
  canvas: "#fafafa",
  surface: "#ffffff",
  surfaceMuted: "#f7f7f7",
  border: "#e8e8e8",

  textPrimary: "#1c1c1c",
  textSecondary: "#585757",
  textMuted: "#969696",

  brandDarkBlue: "#002244",
  brandBlue: "#0474bc",
  brandBrightBlue: "#0085ff",
  brandBlueDarker: "#045e96",
  brandLightBlue: "#e5f3ff",
  brandLighterBlue: "#cce7ff",

  success: "#00ba34",
  successBg: "#e5f8eb",
  successBorder: "#ccf1d6",

  danger: "#de5e68",
  dangerBg: "hsla(0, 100%, 62%, 0.1)",
  dangerBorder: "hsl(359, 85%, 90%)",

  warning: "#f98600"
};

const theme = createTheme({
  palette: {
    mode: "light",

    primary: {
      main: shamiri.brandDarkBlue,
      dark: "#001a36",
      light: shamiri.brandBlue,
      contrastText: shamiri.surface
    },

    secondary: {
      main: shamiri.brandBrightBlue,
      dark: shamiri.brandBlueDarker,
      contrastText: shamiri.surface
    },

    info: {
      main: shamiri.brandBlue,
      light: shamiri.brandLightBlue,
      contrastText: shamiri.surface
    },

    error: {
      main: shamiri.danger,
      light: shamiri.dangerBg,
      contrastText: shamiri.surface
    },

    success: {
      main: shamiri.success,
      light: shamiri.successBg,
      contrastText: shamiri.surface
    },

    warning: {
      main: shamiri.warning
    },

    background: {
      default: shamiri.canvas,
      paper: shamiri.surface
    },

    text: {
      primary: shamiri.textPrimary,
      secondary: shamiri.textSecondary,
      disabled: shamiri.textMuted
    },

    divider: shamiri.border,

    action: {
      hover: shamiri.brandLightBlue,
      selected: shamiri.surfaceMuted,
      disabledBackground: shamiri.surfaceMuted,
      focus: shamiri.surfaceMuted
    }
  },

  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920
    }
  },

  typography: {
    fontFamily: "var(--font-raleway), sans-serif",
    h1: { fontWeight: 800, color: shamiri.brandDarkBlue },
    h2: { fontWeight: 800, color: shamiri.brandDarkBlue },
    h3: { fontWeight: 800, color: shamiri.brandDarkBlue },
    h4: { fontWeight: 800, color: shamiri.brandDarkBlue },
    button: { textTransform: "none", fontWeight: 700 }
  },

  shape: {
    borderRadius: 8
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ":root": {
          "--shamiri-background-secondary": shamiri.surfaceMuted,
          "--shamiri-light-green": shamiri.successBg,
          "--shamiri-border-green": shamiri.successBorder,
          "--shamiri-red-bg": shamiri.dangerBg,
          "--shamiri-red-border": shamiri.dangerBorder
        },
        "*, *::before, *::after": {
          boxSizing: "border-box"
        },
        html: {
          WebkitTextSizeAdjust: "100%"
        },
        body: {
          margin: 0,
          backgroundColor: shamiri.canvas,
          color: shamiri.textPrimary
        },
        a: {
          color: "inherit"
        }
      }
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: `1px solid ${shamiri.border}`
        }
      }
    },

    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${shamiri.border}`,
          boxShadow: "none",
          borderRadius: 12
        }
      }
    },

    MuiButton: {
      defaultProps: {
        disableElevation: true
      },
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingInline: 16,
          paddingBlock: 10
        },
        containedPrimary: {
          backgroundColor: shamiri.brandBrightBlue,
          color: shamiri.surface,
          "&:hover": {
            backgroundColor: shamiri.brandBlueDarker
          }
        },
        containedSecondary: {
          backgroundColor: shamiri.brandBrightBlue,
          color: shamiri.surface,
          "&:hover": {
            backgroundColor: shamiri.brandBlueDarker
          }
        },
        outlinedPrimary: {
          borderColor: shamiri.brandLighterBlue,
          color: shamiri.brandDarkBlue,
          "&:hover": {
            borderColor: shamiri.brandBrightBlue,
            backgroundColor: shamiri.brandLightBlue
          }
        }
      }
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 700
        }
      }
    },

    MuiTextField: {
      defaultProps: {
        fullWidth: true
      }
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: shamiri.surfaceMuted,
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: shamiri.textMuted
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: shamiri.brandBrightBlue,
            borderWidth: 1
          }
        },
        input: {
          color: shamiri.textPrimary
        },
        notchedOutline: {
          borderColor: shamiri.border
        }
      }
    },

    MuiPaginationItem: {
      styleOverrides: {
        root: {
          borderRadius: 8
        }
      }
    }
  }
});

export default theme;
