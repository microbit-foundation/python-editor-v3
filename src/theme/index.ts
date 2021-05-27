import {
  extendTheme,
  withDefaultColorScheme,
  withDefaultVariant,
} from "@chakra-ui/react";

import fonts from "./fonts";
import radii from "./radii";
import colors from "./colors";
import components from "./components";

export const codeFontFamily = "Source Code Pro, monospace";
export const backgroundColorTerm = "#333333"; // Equivalent of "var(--chakra-colors-blackAlpha-800)" on white.
export const defaultCodeFontSizePt = 16;

// See https://chakra-ui.com/docs/theming/customize-theme
const overrides = {
  fonts,
  radii,
  colors,
  components,
};

export default extendTheme(
  overrides,
  withDefaultColorScheme({ colorScheme: "brand" }),
  withDefaultVariant({
    variant: "outline",
    components: ["Button", "IconButton"],
  })
);
