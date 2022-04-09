/**
 * (c) 2021-2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Idea } from "./model";

// Temporarily fetch drafts
const toolkitQuery = (languageId: string): string => {
  if (!languageId.match(/^[a-z-]+$/g)) {
    throw new Error("Invalid language id.");
  }
  return `
  *[_type == "pythonIdea" && language == "${languageId}" && !(_id in path("drafts.**"))]{
    _id, name, language, compatibility, image, slug,
    content[] {
      ...,
      markDefs[]{
        ...,
        _type == "toolkitInternalLink" => {
            "slug": @.reference->slug,
            "targetType": @.reference->_type
        }
      }
    },
  }`;
};

// No need to add a Sanity client dependency just for this.
const toolkitQueryUrl = (languageId: string): string => {
  return (
    "https://ajwvhvgo.api.sanity.io/v1/data/query/apps?query=" +
    encodeURIComponent(toolkitQuery(languageId))
  );
};

const fetchToolkitInternal = async (
  languageId: string
): Promise<Idea[] | undefined> => {
  const response = await fetch(toolkitQueryUrl(languageId));
  if (response.ok) {
    const { result } = await response.json();
    if (!result) {
      throw new Error("Unexpected response format");
    }
    const toolkit = result as Idea[];
    if (toolkit.length === 0) {
      return undefined;
    }
    return toolkit;
  }
  throw new Error("Error fetching toolkit content: " + response.status);
};

export const fetchIdeasToolkit = async (
  languageId: string
): Promise<Idea[]> => {
  const preferred = await fetchToolkitInternal(languageId);
  if (preferred) {
    return preferred;
  }
  const fallback = await fetchToolkitInternal("en");
  if (!fallback) {
    throw new Error("English toolkit must exist");
  }
  return [];
};
