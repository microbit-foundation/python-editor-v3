/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { theme } from "@chakra-ui/theme";

const gray = {
  10: "#fcfcfc",
  ...theme.colors.gray,
};

const colors = {
  brand: gray,
  gray,
  code: {
    blockBorder: theme.colors.gray[400],
    blockBackground: "rgba(52, 162, 235, 0.06)",
    blockBackgroundActive: "lightyellow",
    blockBorderActive: theme.colors.blue[400],

    comment: "gray",
    default: "black",
    keyword: "darkblue",
    literal: "darkgreen",
    string: "green",
    activeLine: theme.colors.gray[100],
  },
};

export default colors;
