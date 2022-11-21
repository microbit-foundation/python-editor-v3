/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { extendTheme, withDefaultVariant } from "@chakra-ui/react";

import colors from "./colors";
import Alert from "./components/alert";
import Button from "./components/button";
import Container from "./components/container";
import Tabs from "./components/tabs";
import Text from "./components/text";
import fontSizes from "./font-sizes";
import fonts from "./fonts";
import radii from "./radii";
import sizes from "./sizes";
import space from "./space";

// See https://chakra-ui.com/docs/theming/customize-theme
const overrides = {
  fonts,
  fontSizes,
  sizes,
  space,
  radii,
  colors,
  components: {
    Alert,
    Button,
    Container,
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
