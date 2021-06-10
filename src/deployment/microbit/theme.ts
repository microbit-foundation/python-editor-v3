import {
  extendTheme,
  withDefaultColorScheme,
  withDefaultVariant,
} from "@chakra-ui/react";

import fonts from "./fonts";
import radii from "./radii";
import colors from "./colors";
// import components from "./components";
import Button from "./components/button";
import Tabs from "./components/tabs";
import Alert from "./components/alert";
import Tooltip from "./components/tooltip";

// See https://chakra-ui.com/docs/theming/customize-theme
const overrides = {
  fonts,
  radii,
  colors,
  components: {
    Alert,
    Button,
    Tabs,
    Tooltip,
  },
};

export default extendTheme(
  overrides,
  withDefaultColorScheme({ colorScheme: "brand" }),
  withDefaultVariant({
    variant: "outline",
    components: ["Button", "IconButton"],
  })
);
