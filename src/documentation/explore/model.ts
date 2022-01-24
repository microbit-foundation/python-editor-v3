/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

import { PortableText } from "../../common/sanity";

export interface Toolkit {
  id: string;
  name: string;
  description: string;
  contents?: ToolkitTopic[];
}

type Product = "microbitV1" | "microbitV2";

interface HasCompatibility {
  compatibility: Product[];
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
  slug: ToolkitSlug;
  image?: ToolkitImage;
}

export interface ToolkitCode {
  _type: "python";
  main: string;
}

export interface ToolkitImage {
  _type: "simpleImage";
  alt?: string;
  // The Sanity image asset.
  asset: any;
}

interface ToolkitAlternative {
  name: string;
  content: PortableText;
}

interface ToolkitSlug {
  current: string;
  _type: string;
}

export interface ToolkitTopicEntry extends HasCompatibility {
  name: string;
  content: PortableText;
  // Should be co-present with alternatives.
  alternativesLabel?: string;
  alternatives?: ToolkitAlternative[];
  detailContent?: PortableText;
  parent: ToolkitTopic;
  slug: ToolkitSlug;
}

export interface ToolkitInternalLink {
  reference: ToolkitTopicEntry;
  targetType: string;
  slug: ToolkitSlug;
}

export interface ToolkitExternalLink {
  href: string;
}

export interface ToolkitApiLink {
  name: string;
}

// Although the data model is more flexible, in the UI we just want to
// show a V2 marker for newer board features.
export const isV2Only = (compatible: HasCompatibility) => {
  return (
    // This will be defined everywhere shortly, but for now we need to cope before the migration.
    compatible.compatibility &&
    compatible.compatibility.length === 1 &&
    compatible.compatibility[0] === "microbitV2"
  );
};
