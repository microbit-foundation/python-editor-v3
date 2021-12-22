/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Toolkit } from "./model";

// For now we just slurp the whole toolkit at once.
// Might revisit depending on eventual size.
const toolkitQuery = (languageId: string): string => {
  return `
  *[_type == "toolkit" && language == "${languageId}" && slug.current == "explore" && !(_id in path("drafts.**"))]{
    id, name, description,
    contents[]->{
      name, compatibility, subtitle, introduction,
      contents[]->{
        name, compatibility, content, alternativesLabel, alternatives, detailContent
      }
    }
  }`;
};
// No need to add a Sanity client dependency just for this.
const toolkitQueryUrl = (languageId: string): string => {
  return (
    "https://ajwvhvgo.api.sanity.io/v1/data/query/apps?query=" +
    encodeURIComponent(toolkitQuery(languageId))
  );
};

const fetchToolkitInternal = async (languageId: string): Promise<Toolkit> => {
  const response = await fetch(toolkitQueryUrl(languageId));
  if (response.ok) {
    const { result } = await response.json();
    if (!result) {
      throw new Error("Unexpected response format");
    }
    const toolkits = result as Toolkit[];
    if (toolkits.length !== 1) {
      throw new Error("Could not find expected toolkit");
    }
    return toolkits[0];
  }
  throw new Error("Error fetching toolkit content: " + response.status);
};

let promise: Promise<Toolkit> | undefined;

export const fetchToolkit = async (languageId: string): Promise<Toolkit> => {
  if (!promise) {
    promise = fetchToolkitInternal(languageId);
  }
  return await promise;
};
