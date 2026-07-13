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

const ChevronRightIcon = ({
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
      d="M.84 1.3l10.47 11.2L.84 23.7a.44.44 0 000 .5c.06.06.08.06.13 0l10.69-11.44a.42.42 0 000-.52L.95.79C.95.74.88.74.82.79a.44.44 0 00.02.51z"
    />
  </svg>
);

export default ChevronRightIcon;
