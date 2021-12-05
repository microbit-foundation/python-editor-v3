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

export interface ToolkitTopic {
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

export interface ToolkitTopicEntry {
  name: string;
  content: ToolkitPortableText;
  // Should be co-present with alternatives.
  alternativesLabel?: string;
  alternatives?: ToolkitAlternative[];
  detailContent?: ToolkitPortableText;
}

export interface ToolkitInternalLink {
  reference: ToolkitTopicEntry;
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
