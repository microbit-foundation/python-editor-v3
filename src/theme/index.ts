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
    blimpTeal: {
      50: "#7bcdc2",
      100: "#7bcec3",
      200: "#7accc1",
      300: "#77c7bc",
      400: "#226077",
    },
    gray: {
      // There are way more grays in the design than the Chakra scale.
      // This would be great to revisit.
      // Do we really use them all?
      50: "#fcfcfc",
      75: "#fcfcfd",
      100: "#f2f2f5",
      125: "#ebebeb",
      150: "#e9eaee",
      200: "#e3e3e3",
      300: "#d7d8d6",
      350: "#d0d0d0",
      400: "#cbcccb",
      450: "#cccccc",
      500: "#c9c9c9",
      550: "#bfc0bf",
      600: "#b0b0b0",
      650: "#a9aaa9",
      700: "#4C4C4C",
      750: "#4d4d4d",
      800: "#262626",
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
                bg: "gray.125",
                outline: "none",
              },
            },
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
