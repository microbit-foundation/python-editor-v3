/**
 * (c) 2021-2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

import { Slug } from "../../common/sanity";

interface PythonModuleItem {
  pythonApiEntry: string;
  referenceLink?: {
    slug: Slug;
  };
  pythonAlternativeContentLink?: string;
}

export interface PythonModule {
  pythonModuleName: string;
  pythonModuleItem: PythonModuleItem[];
}
