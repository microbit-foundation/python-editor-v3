/**
 * (c) 2021-2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

import { PortableText } from "../../common/sanity";
import { HasCompatibility, ToolkitSlug } from "../reference/model";

export interface IdeaImage {
  _type: "image";
  alt?: string;
  // The Sanity image asset.
  asset: any;
}

export interface Idea extends HasCompatibility {
  _id: string;
  name: string;
  image: IdeaImage;
  content?: PortableText;
  language: string;
  slug: ToolkitSlug;
}
