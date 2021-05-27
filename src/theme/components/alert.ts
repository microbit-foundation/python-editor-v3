import { theme } from "@chakra-ui/react";
export const Alert = {
  variants: {
    toast: (props: any) => {
      const base = {
        ...theme.components.Alert.variants["solid"](props),
      };
      return {
        ...base,
        container: {
          ...base.container,
          // Designs say blimpTeal.50 but way too light for white text.
          bg: props.status === "success" ? "blimpTeal.400" : "blimpPink.500",
        },
      };
    },
  },
};

export default Alert;
