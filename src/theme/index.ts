import {
  extendTheme,
  theme,
  withDefaultColorScheme,
  withDefaultVariant,
} from "@chakra-ui/react";

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
    brand: {
      // As provided by Blimp.
      300: "#6f6ac1",
      400: "#6e5fc1",
      500: "#6c4bc1",
      650: "#6c4ac1",
      600: "#50388f",
      700: "#422e75",
    },
    blimpPink: {
      500: "#cd0365", // Failure color
    },
    blimpTeal: {
      50: "#7bcdc2", // Success color
      100: "#7bcec3",
      200: "#7accc1",
      300: "#77c7bc",
      400: "#226077",
    },
    gray: {
      // There are way more grays in the design than the Chakra scale.
      // This would be great to revisit.
      // Do we really use them all?
      10: "#fcfcfc", // Editor background, other light backgrounds
      50: "#ebebeb", // Left area background color
      100: "#e3e3e3",
      200: "#d7d8d6",
      300: "#cbcccb", // Unused was drag handles in the design.
      400: "#c9c9c9",
      500: "#b0b0b0", // Edit project name (but 80% alpha), active buttons
      600: "#a9aaa9", // todo: Line numbers
      700: "#4c4c4c", // Muted text color, project name icon
      800: "#262626", // Main text color
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: "4xl",
      },
      variants: {
        zoom: (props: any) => {
          const base = {
            ...theme.components.Button.variants.solid(props),
          };
          return {
            ...base,
            _hover: {
              ...base._hover,
              backgroundColor: "gray.400",
            },
            _active: {
              ...base._active,
              backgroundColor: "gray.500",
            },
          };
        },
        outline: {
          borderWidth: "2px",
          color: "brand.500",
          _hover: {
            color: "brand.600",
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
                color: "brand.300",
                bg: "gray.50",
                outline: "none",
              },
            },
          };
        },
      },
    },
    Alert: {
      variants: {
        toast: (props: any) => {
          const base = {
            ...theme.components.Alert.variants["solid"](props),
          };
          return {
            ...base,
            container: {
              ...base.container,
              // Designs say blimpTeal.50 but way too light for white text.
              bg: props.status === "success" ? "blimpTeal.400" : "blimpPink.500"
            }
          };
        },
      },
    },
  },
};

export default extendTheme(
  overrides,
  withDefaultColorScheme({ colorScheme: "brand" }),
  withDefaultVariant({
    variant: "outline",
    components: ["Button", "IconButton"],
  })
);
