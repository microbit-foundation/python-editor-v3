import { extendTheme, theme } from "@chakra-ui/react";

const overrides = {
  // See https://chakra-ui.com/docs/theming/customize-theme

  components: {
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
