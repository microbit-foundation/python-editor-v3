/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

import unconfiguredImageUrlBuilder from "@sanity/image-url";
import { dataset, project } from "./sanity";

export const defaultQuality = 80;

export const imageUrlBuilder = unconfiguredImageUrlBuilder()
  // Hardcoded for now as there's no practical alternative.
  .projectId(project)
  .dataset(dataset)
  .auto("format")
  .dpr(window.devicePixelRatio ?? 1)
  .quality(defaultQuality);

/**
 * Percentage padding-bottom matching the image's aspect ratio, read from the
 * dimensions embedded in a Sanity image reference. Used to reserve an image's
 * height before it loads via a padding spacer rather than the aspect-ratio
 * property, which Safari 14 does not support.
 */
export const getAspectRatioPadding = (imageRef: string): string | undefined => {
  const dimensionsArr = imageRef.match(/\d+x\d+/g);
  if (!dimensionsArr) {
    return undefined;
  }
  const dimensions = dimensionsArr.join().split("x");
  const [width, height] = dimensions.map((n: string) => Number(n));
  return `${(height / width) * 100}%`;
};
