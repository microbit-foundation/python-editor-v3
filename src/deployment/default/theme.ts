/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { extendTheme, withDefaultVariant } from "@chakra-ui/react";

import fonts from "./fonts";
import fontSizes from "./font-sizes";
import radii from "./radii";
import colors from "./colors";
import spacing from "./spacing";
import Button from "./components/button";
import Tabs from "./components/tabs";
import Alert from "./components/alert";
import Text from "./components/text";

// See https://chakra-ui.com/docs/theming/customize-theme
const overrides = {
  fonts,
  fontSizes,
  ...spacing,
  radii,
  colors,
  components: {
    Alert,
    Button,
    Tabs,
    Text,
  },
};

export default extendTheme(
  overrides,
  withDefaultVariant({
    variant: "outline",
    components: ["Button", "IconButton"],
  })
);
