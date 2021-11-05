/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

export interface Toolkit {
  name: string;
  description: string;
  contents: ToolkitTopic[];
}

export interface ToolkitTopic {
  name: string;
  /**
   * Short, for the listing.
   */
  description: string;
  /**
   * Longer, for the heading above the contents.
   */
  introduction?: string;
  contents: ToolkitTopicItem[];
}

export interface ToolkitCode {
  _type: "code";
  detail?: boolean;
  value: string;
  select?: {
    prompt: string;
    options: string[];
    placeholder: string;
  };
}

export interface ToolkitText {
  _type: "text";
  detail?: boolean;
  value: string;
}

export interface ToolkitTopicItem {
  name: string;
  contents: Array<ToolkitCode | ToolkitText>;
}

export interface ToolkitNavigationState {
  topicId?: string;
  itemId?: string;
}
