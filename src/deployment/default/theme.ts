import { extendTheme, withDefaultVariant } from "@chakra-ui/react";

import fonts from "./fonts";
import radii from "./radii";
import colors from "./colors";
import Button from "./components/button";
import Tabs from "./components/tabs";
import Alert from "./components/alert";

// See https://chakra-ui.com/docs/theming/customize-theme
const overrides = {
  fonts,
  radii,
  colors,
  components: {
    Alert,
    Button,
    Tabs,
  },
};

export default extendTheme(
  overrides,
  withDefaultVariant({
    variant: "outline",
    components: ["Button", "IconButton"],
  })
);
