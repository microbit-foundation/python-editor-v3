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
  components: {
    Button: {
      baseStyle: {
        borderRadius: "4xl",
      },
      variants: {
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
                // Should be the forground from the design
                color: "#6F6AC1",
                // Should be the background color we already use
                // for the left area
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
