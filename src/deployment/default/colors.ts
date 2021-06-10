import { theme } from "@chakra-ui/theme";

const gray = {
  10: "#fcfcfc",
  ...theme.colors.gray,
};

const colors = {
  brand: gray,
  gray,
  code: {
    block: "rgba(52, 162, 235, 0.06)",
    comment: "gray",
    default: "black",
    keyword: "darkblue",
    literal: "darkgreen",
    string: "green",
    activeLine: theme.colors.gray[100],
  },
};

export default colors;
