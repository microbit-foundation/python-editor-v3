/**
 * (c) 2021 - 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { css } from "styled-system/css";

// A class rather than a style object: Panda can only statically extract
// styles written literally at the definition site, not objects spread into
// a css prop elsewhere.
export const docStylesClass = css({
  "& p, & h3": {
    maxWidth: "600px",
  },
  listStylePosition: "inside",
  "& ol": {
    pl: "3",
  },
  "& ul": { listStyleType: "disc", pl: "3" },
});
