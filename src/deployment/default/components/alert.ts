/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { StyleFunctionProps, theme } from "@chakra-ui/react";
import { StyleConfig } from "@chakra-ui/theme-tools";

// Per-status background for the "toast" variant, driven by semantic tokens so
// the brand recolour lives in token values, not forked structure (see
// RAC-MIGRATION.md). Falls back to the error token for unknown statuses.
const toastBgByStatus: Record<string, string> = {
  success: "toastSuccessBg",
  info: "toastInfoBg",
  warning: "toastWarningBg",
  error: "toastErrorBg",
  loading: "toastInfoBg",
};

const Alert: StyleConfig = {
  variants: {
    toast: (props: StyleFunctionProps) => {
      const base = {
        // Issue with _dark leads to any here.
        ...(theme.components.Alert.variants!.solid(props) as any),
      };
      return {
        ...base,
        container: {
          ...base.container,
          bg: toastBgByStatus[props.status] ?? "toastErrorBg",
        },
      };
    },
  },
};

export default Alert;
