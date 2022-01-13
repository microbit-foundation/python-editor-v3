/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

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
  introduction?: ToolkitPortableText;
  contents?: ToolkitTopicEntry[];
  slug: ToolkitSlug;
}

export interface ToolkitCode {
  _type: "python";
  main: string;
}

export interface ToolkitText {
  _type: "block";
  _key: string;
  // Partial/lax modelling. We pass this straight to Sanity's rendering API.
  children: any;
  markDefs: any;
  style: string;
}

export interface ToolkitImage {
  _type: "simpleImage";
  alt?: string;
  // The Sanity image asset.
  asset: any;
}

export type ToolkitPortableText = Array<
  ToolkitCode | ToolkitText | ToolkitImage
>;

interface ToolkitAlternative {
  name: string;
  content: ToolkitPortableText;
}

interface ToolkitSlug {
  current: string;
  _type: string;
}

export interface ToolkitTopicEntry extends HasCompatibility {
  name: string;
  content: ToolkitPortableText;
  // Should be co-present with alternatives.
  alternativesLabel?: string;
  alternatives?: ToolkitAlternative[];
  detailContent?: ToolkitPortableText;
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

export interface ToolkitNavigationState {
  topicId?: string;
  itemId?: string;
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
