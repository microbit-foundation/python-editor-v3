/**
 * (c) 2024, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { css } from "@microbit/ui";

/** Back arrow glyph, sized like an icon (1em, currentColor). */
const BackArrow = () => (
  <svg
    viewBox="0 0 22 16"
    aria-hidden
    className={css({
      width: "1em",
      height: "1em",
      display: "inline-block",
      flexShrink: 0,
    })}
  >
    <path
      d="M3.82843 6.9999L22 7V9L3.82843 8.9999L9.1924 14.3638L7.7782 15.778L0 7.9999L7.7782 0.22168L9.1924 1.63589L3.82843 6.9999Z"
      fill="currentColor"
    />
  </svg>
);

export default BackArrow;
