import { theme } from "@chakra-ui/react";

const Tabs = {
  variants: {
    sidebar: (props: any) => {
      const base = {
        ...theme.components.Tabs.variants["solid-rounded"](props),
      };
      return {
        ...base,
        tab: {
          ...base.tab,
          transition: "none",
          ml: "5px",
          borderRadius: "32px 0 0 32px",
          _selected: {
            color: "brand.300",
            bg: "gray.50",
            outline: "none",
          },
          _focus: {
            boxShadow: "initial",
          },
          _active: {},
        },
      };
    },
  },
};

export default Tabs;
