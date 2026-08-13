/**
 * (c) 2021 - 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { css } from "styled-system/css";

// Follows the pattern used by the AspectRatio component which uses a
// percentage-padding spacer rather than the aspect-ratio property, which is
// not supported in Safari 14. Only apply when --aspect-ratio-padding is set or
// the wrapper collapses to zero height.
export const runtimeAspectRatioClass = css({
  position: "relative",
  _before: {
    content: '""',
    display: "block",
    height: 0,
    paddingBottom: "var(--aspect-ratio-padding)",
  },
  "& > *": {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
  },
});

// A class rather than a style object: Panda can only statically extract
// styles written literally at the definition site, not objects spread into
// a css prop elsewhere.
export const docStylesClass = css({
  "& p, & h3": {
    maxWidth: "600px",
  },
  // On the lists, not just inherited from here: preflight's
  // `ul { list-style: none }` shorthand resets list-style-position to
  // `outside`, which would silently win over the inherited value.
  listStylePosition: "inside",
  "& ol": {
    listStyleType: "decimal",
    pl: "3",
    listStylePosition: "inside",
  },
  "& ul": {
    listStyleType: "disc",
    pl: "3",
    listStylePosition: "inside",
  },
});
