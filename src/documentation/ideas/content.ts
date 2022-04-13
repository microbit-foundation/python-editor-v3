/**
 * (c) 2021-2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { fetchContent } from "../../common/sanity";
import { Idea } from "./model";

export const fetchIdeas = async (languageId: string): Promise<Idea[]> =>
  fetchContent(languageId, ideasQuery, adaptContent);

const ideasQuery = (languageId: string): string => {
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

const adaptContent = (result: any): Idea[] | undefined => {
  const ideas = result as Idea[];
  if (ideas.length === 0) {
    return undefined;
  }
  return ideas;
};
