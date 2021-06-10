const colors = {
  brand: {
    // As provided by Blimp.
    300: "#6f6ac1",
    400: "#6e5fc1",
    500: "#6c4bc1",
    600: "#50388f",
    700: "#422e75",
  },
  blimpPink: {
    500: "#cd0365", // Failure color
  },
  blimpTeal: {
    50: "#7bcdc2", // Success color
    100: "#7bcec3",
    200: "#7accc1",
    300: "#77c7bc",
    400: "#226077",
  },
  gray: {
    // There are way more grays in the design than the Chakra scale.
    // This would be great to revisit.
    // Do we really use them all?
    10: "#fcfcfc", // Editor background, other light backgrounds
    50: "#ebebeb", // Left area background color
    100: "#e3e3e3",
    200: "#d7d8d6",
    300: "#cbcccb", // Unused was drag handles in the design.
    400: "#c9c9c9",
    500: "#b0b0b0", // Edit project name (but 80% alpha), active buttons
    600: "#a9aaa9", // Line numbers
    700: "#4c4c4c", // Muted text color, project name icon
    800: "#262626", // Main text color, active line
  },
  code: {
    // Used in the CM theme which is common across deployments.
    block: "rgba(123, 205, 194, 0.1)",
    comment: "#6c4bc1",
    default: "#262626",
    keyword: "#9d4ea9",
    literal: "#226077",
    string: "#ae1f1f",
    activeLine: "#7bcec333",
  },
};

export default colors;
