import { theme } from "@chakra-ui/react";

const Button = {
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
};

export default Button;
