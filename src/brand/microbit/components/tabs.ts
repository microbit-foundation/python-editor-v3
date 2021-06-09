import { theme } from "@chakra-ui/react";

const Tabs = {
  variants: {
    sidebar: (props: any) => {
      const base = {
        ...theme.components.Tabs.variants["solid-rounded"](props),
      };
      return {
        ...base,
        tablist: {
          // background: "transparent linear-gradient(to bottom, var(--chakra-colors-brand-500) 0%, var(--chakra-colors-blimpTeal-50) 100%) 0% 0% no-repeat padding-box;"
          background: "black",
        },
        tab: {
          ...base.tab,
          transition: "none",
          ml: "6px",
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
