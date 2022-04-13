/**
 * (c) 2021-2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

import { PortableText, SimpleImage, Slug } from "../../common/sanity";
import { HasCompatibility } from "../common/model";

export interface Idea extends HasCompatibility {
  _id: string;
  name: string;
  image: SimpleImage;
  content?: PortableText;
  language: string;
  slug: Slug;
}
