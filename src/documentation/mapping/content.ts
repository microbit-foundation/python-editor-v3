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

type ApiReferenceMap = Record<string, Record<string, ReferenceLinkDetail>>;

interface ReferenceLinkDetail {
  referenceLink?: string;
  dropdown?: string;
}

const adaptContent = (result: any): ApiReferenceMap | undefined => {
  const mappingData = result as PythonModule[];
  if (mappingData.length === 0) {
    return undefined;
  }
  const map: ApiReferenceMap = {};
  for (const module of mappingData) {
    for (const moduleItem of module.pythonModuleItem) {
      map[module.pythonModuleName] = {
        ...map[module.pythonModuleName],
        [moduleItem.pythonApiEntry]: {
          referenceLink: moduleItem.referenceLink?.slug.current || "",
          dropdown: moduleItem.pythonAlternativeContentLink || "",
        },
      };
    }
  }
  return map;
};
