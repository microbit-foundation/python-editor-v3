/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  ApiDocsContent,
  ApiDocsEntry,
  ApiDocsResponse,
} from "../../language-server/apidocs";

export const pullModulesToTop = (input: ApiDocsContent) => {
  const recurse = (docs: ApiDocsEntry[], topLevel: boolean) => {
    let removedSoFar = 0;
    [...docs].forEach((d, index) => {
      if (d.kind === "module" && !topLevel) {
        input.content[d.fullName] = d;
        docs.splice(index - removedSoFar, 1);
        removedSoFar++;
      }
      if (d.children) {
        recurse(d.children, false);
      }
    });
  };
  recurse(Object.values(input.content), true);
};

export const resolveModule = (
  docs: ApiDocsResponse,
  name: string
): ApiDocsEntry | undefined => {
  return Object.values(docs)
    .filter(
      (module) =>
        name === module.fullName || name.startsWith(module.fullName + ".")
    )
    .reduce(
      (acc: ApiDocsEntry | undefined, curr) =>
        // Longest match wins.
        !acc || acc.fullName.length < curr.fullName.length ? curr : acc,
      undefined
    );
};

export const moduleAndApiFromId = (id: string) => {
  const idSegments = id.split(".");
  const pythonModuleName = idSegments[0];
  const apiId = idSegments.slice(1).join(".");
  return {
    pythonModuleName,
    apiId,
  };
};
