import { theme } from "@chakra-ui/react";

const Alert = {
  variants: {
    toast: (props: any) => {
      const base = {
        ...theme.components.Alert.variants["solid"](props),
      };
      return base;
    },
  },
};

export default Alert;
