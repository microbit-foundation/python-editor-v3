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
  description: string;
  contents: ToolkitTopicItem[];
}

export interface ToolkitTopicItem {
  name: string;
  text: string;
  code: string;
  furtherText?: string;
}

export interface ToolkitNavigationState {
  topicId?: string;
  itemId?: string;
}
