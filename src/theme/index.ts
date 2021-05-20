import { extendTheme, theme } from "@chakra-ui/react";

export const codeFontFamily = "Source Code Pro, monospace";
export const backgroundColorTerm = "#333333"; // Equivalent of "var(--chakra-colors-blackAlpha-800)" on white.
export const defaultCodeFontSizePt = 16;

// See https://chakra-ui.com/docs/theming/customize-theme
const overrides = {
  fonts: {
    heading: "Helvetica, Arial, sans-serif",
    body: "Helvetica, Arial, sans-serif",
  },
  radii: {
    // Design radius for buttons and other larger items
    "4xl": "2rem",
  },
  colors: {
    blimpPurple: {
      300: "#6f6ac1",
      400: "#6e5fc1",
      500: "#6c4bc1",
      650: "#6c4ac1",
      600: "#50388f",
      700: "#422e75",
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: "4xl",
      },
      variants: {
        outline: {
          borderWidth: "2px",
          color: "blimpPurple.500",
          _hover: {
            color: "blimpPurple.600",
          },
        },
        sidebar: (props: any) => {
          const base = {
            ...theme.components.Button.variants.ghost(props),
          };
          return {
            ...base,
            _hover: {
              ...base._hover,
              color: "blackAlpha.800",
            },
            _active: {
              ...base._hover,
              color: "blackAlpha.800",
            },
          };
        },
      },
    },
    Tabs: {
      variants: {
        sidebar: (props: any) => {
          const base = {
            ...theme.components.Tabs.variants["solid-rounded"](props),
          };
          return {
            ...base,
            tab: {
              ...base.tab,
              borderRadius: "unset",
              _selected: {
                color: "#6F6AC1",
                bg: "var(--content-background)",
                outline: "none",
              },
            },
          };
        },
      },
    },
  },
};

export default extendTheme(overrides);
