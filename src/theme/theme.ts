"use client";

import { createTheme } from "@mui/material/styles";

// Shamiri brand tokens (from inspected CSS variables)
const shamiri = {
  offWhite: "#faf9fe",
  navyBlue: "#132964",
  cardGrey: "#ebe8fa",
  strokeGrey: "#ebe8fa",
  greyDark: "#d7d2fd",

  lilacPurple: "#9a8ee6",
  lime: "#b8e91a",
  limeLight: "#f1fbd1",

  magenta: "#d91892",
  magentaLight: "#f7d1e9",

  red: "#ca4949",
  redLight: "#f8e2e2",

  blueLight: "#d0d4e0",

  actionHover: "#3e3f416b",
  transparent: "#00000000"
};

const theme = createTheme({
  palette: {
    mode: "light",

    primary: {
      main: shamiri.navyBlue,
      contrastText: shamiri.offWhite
    },

    secondary: {
      main: shamiri.lime,
      contrastText: shamiri.navyBlue
    },

    error: {
      main: shamiri.red,
      light: shamiri.redLight,
      contrastText: shamiri.offWhite
    },

    success: {
      main: shamiri.lime,
      contrastText: shamiri.navyBlue
    },

    background: {
      default: shamiri.offWhite,
      paper: shamiri.cardGrey
    },

    text: {
      primary: shamiri.navyBlue,
      secondary: "#5f6e9b",
      disabled: shamiri.blueLight
    },

    divider: shamiri.strokeGrey,

    action: {
      hover: shamiri.actionHover,
      selected: shamiri.greyDark,
      disabledBackground: shamiri.greyDark,
      focus: shamiri.greyDark
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
    h1: { fontWeight: 800, color: shamiri.navyBlue },
    h2: { fontWeight: 800, color: shamiri.navyBlue },
    h3: { fontWeight: 800, color: shamiri.navyBlue },
    button: { textTransform: "none", fontWeight: 700 }
  },

  shape: {
    borderRadius: 4
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ":root": {
          "--shamiri-off-white": shamiri.offWhite,
          "--shamiri-navy": shamiri.navyBlue,
          "--shamiri-lime": shamiri.lime,
          "--shamiri-lilac": shamiri.lilacPurple,
          "--shamiri-card": shamiri.cardGrey,
          "--shamiri-stroke": shamiri.strokeGrey,
          "--shamiri-magenta": shamiri.magenta
        },
        body: {
          backgroundColor: shamiri.offWhite,
          color: shamiri.navyBlue
        }
      }
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: `1px solid ${shamiri.strokeGrey}`
        }
      }
    },

    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${shamiri.strokeGrey}`,
          boxShadow: "none"
        }
      }
    },

    MuiButton: {
      defaultProps: {
        disableElevation: true
      },
      styleOverrides: {
        root: {
          borderRadius: 14,
          paddingInline: 16,
          paddingBlock: 10
        },
        containedPrimary: {
          backgroundColor: shamiri.navyBlue,
          color: shamiri.offWhite,
          "&:hover": {
            backgroundColor: "#0e2244"
          }
        },
        containedSecondary: {
          backgroundColor: shamiri.lime,
          color: shamiri.navyBlue,
          "&:hover": {
            backgroundColor: "#a6d516"
          }
        },
        outlinedPrimary: {
          borderColor: shamiri.greyDark,
          color: shamiri.navyBlue,
          "&:hover": {
            borderColor: shamiri.lilacPurple,
            backgroundColor: shamiri.cardGrey
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
          borderRadius: 14,
          backgroundColor: shamiri.offWhite
        },
        notchedOutline: {
          borderColor: shamiri.greyDark
        }
      }
    }
  }
});

export default theme;
