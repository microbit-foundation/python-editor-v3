/**
 * (c) 2021-2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

import { PortableText, SimpleImage, Slug } from "../../common/sanity";
import { HasCompatibility } from "../common/model";

export interface Toolkit {
  id: string;
  name: string;
  description: string;
  contents?: ToolkitTopic[];
  language: string;
}

export interface ToolkitTopic extends HasCompatibility {
  name: string;
  /**
   * Short, for the listing.
   */
  subtitle: string;
  /**
   * Longer, for the heading above the contents.
   * Currently migrating to portable text.
   */
  introduction?: PortableText;
  contents?: ToolkitTopicEntry[];
  slug: Slug;
  image?: SimpleImage;
}

export interface ToolkitCode {
  _type: "python";
  main: string;
}

interface ToolkitAlternative {
  name: string;
  content: PortableText;
  slug: Slug;
}

export interface ToolkitTopicEntry extends HasCompatibility {
  name: string;
  // Can be missing for alternatives-only entries.
  content?: PortableText;
  // Should be co-present with alternatives.
  alternativesLabel?: string;
  alternatives?: ToolkitAlternative[];
  detailContent?: PortableText;
  parent: ToolkitTopic;
  slug: Slug;
}

export interface ToolkitInternalLink {
  reference: ToolkitTopicEntry;
  targetType: string;
  slug: Slug;
}

export interface ToolkitExternalLink {
  href: string;
}

export interface ToolkitApiLink {
  name: string;
}
