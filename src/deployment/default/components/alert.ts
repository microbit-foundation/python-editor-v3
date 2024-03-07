/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { StyleFunctionProps, theme } from "@chakra-ui/react";

const Alert = {
  variants: {
    toast: (props: StyleFunctionProps) => {
      const base = {
        ...theme.components.Alert.variants!["solid"](props),
      };
      return base;
    },
  },
};

export default Alert;
