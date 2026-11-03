/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BrandConfigFactory, LogoProps } from "..";

// Inline styles rather than Panda, matching the private brand package,
// which is resolved from node_modules outside Panda's extraction scope.
const AppLogo = ({ h, color }: LogoProps) => (
  <span
    style={{
      display: "flex",
      alignItems: "center",
      height: h,
      color,
      fontSize: "1.5rem",
      lineHeight: 1,
      whiteSpace: "nowrap",
    }}
  >
    Python Editor
  </span>
);

// The sidebar header sizes these from their width alone, so a logo without
// intrinsic height leaves the link that wraps it unclickable.
const squareLogo = (
  <svg viewBox="0 0 57 40" width="100%" role="presentation">
    <rect
      x="1"
      y="1"
      width="55"
      height="38"
      rx="6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <text
      x="28.5"
      y="27"
      textAnchor="middle"
      fill="currentColor"
      fontFamily="sans-serif"
      fontSize="18"
    >
      Py
    </text>
  </svg>
);

const horizontalLogo = (
  <svg viewBox="0 0 146 24" width="100%" role="presentation">
    <text
      x="0"
      y="18"
      fill="currentColor"
      fontFamily="sans-serif"
      fontSize="18"
    >
      Python Editor
    </text>
  </svg>
);

const defaultBrandFactory: BrandConfigFactory = () => ({
  product: "python-editor",
  AppLogo,
  squareLogo,
  horizontalLogo,
  // This isn't ideal as it's the branded version. You can just remove the field to remove the welcome dialog.
  welcomeVideoYouTubeId: "mREwMW69qKc",
});

export default defaultBrandFactory;
