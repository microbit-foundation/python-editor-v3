import { theme } from "@chakra-ui/react";
export const components = {
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
};

export default components;
