/**
 * (c) 2021-2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { fetchContent } from "../../common/sanity";
import { PythonModule } from "./model";

export const fetchMappingData = async (): Promise<ApiReferenceMap> =>
  fetchContent("", mappingQuery, adaptContent);

const mappingQuery = (): string => {
  return `
  *[_type == "pythonModule" && !(_id in path("drafts.**"))]{
    pythonModuleName,
    pythonModuleItem[] {
      pythonAlternativeContentLink,
      pythonApiEntry,
      referenceLink {
        _type == "reference" =>^-> {
          slug
        }
      }
    }
  }`;
};

export type ApiReferenceMap = Record<
  string,
  Record<string, ReferenceLinkDetail>
>;

export interface ReferenceLinkDetail {
  referenceLink: string;
  alternative?: string;
}

const adaptContent = (result: any): ApiReferenceMap | undefined => {
  const mappingData = result as PythonModule[];
  if (mappingData.length === 0) {
    return undefined;
  }
  const map: ApiReferenceMap = {};
  for (const module of mappingData) {
    for (const moduleItem of module.pythonModuleItem) {
      const referenceLink = moduleItem.referenceLink?.slug.current;
      const alternative = moduleItem.pythonAlternativeContentLink;
      if (referenceLink) {
        map[module.pythonModuleName] = {
          ...map[module.pythonModuleName],
          [moduleItem.pythonApiEntry]: {
            referenceLink,
            alternative,
          },
        };
      }
    }
  }
  return map;
};
