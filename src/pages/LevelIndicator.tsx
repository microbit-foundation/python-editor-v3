/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { FormattedMessage } from "react-intl";
import { css } from "styled-system/css";

/** A microbit.org project's level, as the main site has it. */
export type Level = "beginner" | "intermediate" | "advanced";

/** How many of the bars are filled, less one. */
const levelNumber: Record<Level, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

const levelMessageId: Record<Level, string> = {
  beginner: "level-beginner",
  intermediate: "level-intermediate",
  advanced: "level-advanced",
};

const color = "#999999";

/** Rising bars, filled up to the level. Copied from microbit.org. */
const LevelImage = ({ value }: { value: Level }) => {
  const level = levelNumber[value];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="25"
      height="16"
      viewBox="0 0 25 16"
      aria-hidden
      className={css({ flexShrink: 0, marginInlineEnd: "10px" })}
    >
      <g
        fill="none"
        fillRule="nonzero"
        stroke={color}
        transform="translate(1 1)"
      >
        <rect
          width="5"
          height="14"
          x="18"
          rx="1"
          fill={level >= 2 ? color : undefined}
        />
        <rect
          width="5"
          height="10"
          x="9"
          y="4"
          rx="1"
          fill={level >= 1 ? color : undefined}
        />
        <rect
          width="5"
          height="6"
          y="8"
          rx="1"
          fill={level >= 0 ? color : undefined}
        />
      </g>
    </svg>
  );
};

/**
 * A project's level with microbit.org's bars icon. No typography here; the
 * caller decides it. Not mirrored for right-to-left as the main site is: this
 * app has no right-to-left languages.
 */
const LevelIndicator = ({ value }: { value: Level }) => (
  // Baseline alignment sits the text on the icon's bottom edge.
  <span className={css({ display: "inline-flex", alignItems: "baseline" })}>
    <LevelImage value={value} />
    <span>
      <FormattedMessage id={levelMessageId[value]} />
    </span>
  </span>
);

export default LevelIndicator;
