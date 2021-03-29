import { extendTheme, theme } from "@chakra-ui/react";

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
