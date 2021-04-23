import { extendTheme, theme } from "@chakra-ui/react";

export const codeFontFamily = "monospace";
export const backgroundColorTerm = "#333333"; // Equivalent of "var(--chakra-colors-blackAlpha-800)" on white.
export const defaultCodeFontSizePt = 16;

const overrides = {
  // See https://chakra-ui.com/docs/theming/customize-theme

  components: {
    Button: {
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
                color: "white",
                bg: "blue.800",
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
