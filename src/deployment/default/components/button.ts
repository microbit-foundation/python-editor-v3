/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { StyleFunctionProps, theme } from "@chakra-ui/react";

const Button = {
  baseStyle: {
    borderRadius: "button",
  },
  variants: {
    unstyled: {
      borderRadius: "unset",
    },
    // Ideally we'd drop this variant.
    zoom: (props: StyleFunctionProps) => {
      const base = theme.components.Button.variants!.solid(props);
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
    outline: ({ colorScheme }: StyleFunctionProps) => ({
      borderWidth: "2px",
      color: `${colorScheme}.${colorScheme === "brand" ? "500" : "600"}`,
      _hover: {
        color: `${colorScheme}.${colorScheme === "brand" ? "600" : "700"}`,
        bg: "transparent",
      },
    }),
    sidebar: (props: StyleFunctionProps) => {
      const base = {
        ...theme.components.Button.variants!.ghost(props),
      };
      return {
        ...base,
        _hover: {
          ...base._hover,
          bg: "white",
          color: "gray.700",
        },
        _active: {
          ...base._hover,
          bg: "white",
          color: "gray.800",
        },
      };
    },
    // Text driven by the languageText* semantic tokens; borders/hover follow
    // the gray ramp. Brand divergence lives in those token values.
    language: () => ({
      borderWidth: "2px",
      borderColor: "gray.200",
      color: "languageText",
      _hover: {
        color: "languageTextHover",
        bg: "gray.100",
      },
    }),
  },
};

export default Button;
