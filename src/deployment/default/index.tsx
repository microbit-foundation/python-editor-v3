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

const defaultBrandFactory: BrandConfigFactory = () => ({
  product: "python-editor",
  AppLogo,
  // This isn't ideal as it's the branded version. You can just remove the field to remove the welcome dialog.
  welcomeVideoYouTubeId: "mREwMW69qKc",
});

export default defaultBrandFactory;
