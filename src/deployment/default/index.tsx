/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BrandConfigFactory } from "..";

const defaultBrandFactory: BrandConfigFactory = () => ({
  product: "python-editor",
  // This isn't ideal as it's the branded version. You can just remove the field to remove the welcome dialog.
  welcomeVideoYouTubeId: "mREwMW69qKc",
});

export default defaultBrandFactory;
