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
  *[_type == "pythonIdea" && language == "${languageId}"]{
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

const hardCodedResults: Idea[] = [
  {
    _id: "drafts.6a47941f-babf-4902-b42e-6c6f886230f8",
    compatibility: ["microbitV1", "microbitV2"],
    content: [
      {
        _key: "85f727a2176e",
        _type: "block",
        children: [
          {
            _key: "0a064776de5f",
            _type: "span",
            marks: [],
            text: "Some content",
          },
        ],
        markDefs: [],
        style: "normal",
      },
      { _key: "0720595323b9", _type: "python", main: "# some code" },
      {
        _key: "d6450d88eddc",
        _type: "block",
        children: [
          {
            _key: "4411498314bd",
            _type: "span",
            marks: [],
            text: "Some more content if required.",
          },
        ],
        markDefs: [],
        style: "normal",
      },
    ],
    image: {
      _type: "image",
      asset: {
        _ref: "image-462ad9350fa259a6c6504125ae2246d0707cadbf-383x313-gif",
        _type: "reference",
      },
    },
    language: "en",
    name: "Name badge",
    slug: { _type: "slug", current: "name-badge" },
  },
];

const fetchToolkitInternal = async (
  languageId: string
): Promise<Idea | undefined> => {
  const response = await fetch(toolkitQueryUrl(languageId));
  if (response.ok) {
    const { result } = await response.json();
    if (!result) {
      throw new Error("Unexpected response format");
    }
    const toolkits = result as Idea[];
    if (toolkits.length === 0) {
      return undefined;
    }
    if (toolkits.length > 1) {
      throw new Error("Unexpected results");
    }
    // Add topic entry parent for toolkit navigation.
    const toolkit = toolkits[0];
    return toolkit;
  }
  throw new Error("Error fetching toolkit content: " + response.status);
};

export const fetchIdeasToolkit = async (
  languageId: string
): Promise<Idea[]> => {
  // const preferred = await fetchToolkitInternal(languageId);
  if (hardCodedResults) {
    // Use temporary hardcoded due to failure to fetch data here.
    return hardCodedResults;
  }
  // const fallback = await fetchToolkitInternal("en");
  // if (!fallback) {
  //   throw new Error("English toolkit must exist");
  // }
  return [];
};
