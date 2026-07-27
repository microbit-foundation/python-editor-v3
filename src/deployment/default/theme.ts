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
import Tooltip from "./components/tooltip";
import fontSizes from "./font-sizes";
import fonts from "./fonts";
import radii from "./radii";
import sizes from "./sizes";
import space from "./space";

// See https://chakra-ui.com/docs/theming/customize-theme
//
// Semantic tokens carry the OSS/private brand divergence during the
// RAC/Panda semantic-token pre-work: component configs stay structurally
// identical across the two themes and reference these tokens, so brand
// divergence lives in token values rather than in forked component structure
// (see RAC-MIGRATION.md). The private theme overrides the same token names.
const semanticTokens = {
  colors: {
    // App chrome (sidebar). OSS flat black; private uses brand colours /
    // a gradient (see the private theme). A semantic token can hold a
    // gradient string.
    sidebarHeaderBg: "black",
    sidebarTablistBg: "black",
    sidebarTabSelectedText: "black",
    sidebarTabSelectedBg: "gray.50",
    // Button "language" variant text (base preset precedent: languageText*).
    languageText: "brand.500",
    languageTextHover: "brand.600",
    // Alert "toast" variant per-status background. OSS reproduces Chakra's
    // default solid status colours; private recolours to brand.
    toastSuccessBg: "green.500",
    toastInfoBg: "blue.500",
    toastWarningBg: "orange.500",
    toastErrorBg: "red.500",
  },
};

const overrides = {
  fonts,
  fontSizes,
  sizes,
  space,
  radii,
  colors,
  semanticTokens,
  components: {
    Alert,
    Button,
    Container,
    Tabs,
    Text,
    Tooltip,
  },
};

export default extendTheme(
  overrides,
  withDefaultVariant({
    variant: "outline",
    components: ["Button", "IconButton"],
  })
);
