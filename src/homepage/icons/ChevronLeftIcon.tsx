/**
 * (c) 2024, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
type Props = {
  className?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
};

const ChevronLeftIcon = ({
  className = "",
  fill = "none",
  stroke = "#556C84",
  strokeWidth = 1.5,
}: Props) => (
  <svg viewBox="0 0 12.5 25" className={className}>
    <path
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      d="M11.7 23.7L1.2 12.5 11.7 1.3c.1-.2.1-.3 0-.5-.1-.1-.1-.1-.1 0L.8 12.2c-.1.2-.1.4 0 .5l10.7 11.4h.1c.2 0 .2-.3.1-.4z"
    />
  </svg>
);

export default ChevronLeftIcon;
