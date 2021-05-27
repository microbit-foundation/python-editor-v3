import { theme } from "@chakra-ui/react";
export const Tabs = {
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
};

export default Tabs;
