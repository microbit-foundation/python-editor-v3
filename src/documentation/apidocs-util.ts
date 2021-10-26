/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ApiDocsEntry, ApiDocsResponse } from "../language-server/apidocs";

export const pullModulesToTop = (input: ApiDocsResponse) => {
  const recurse = (docs: ApiDocsEntry[], topLevel: boolean) => {
    let removedSoFar = 0;
    [...docs].forEach((d, index) => {
      if (d.kind === "module" && !topLevel) {
        input[d.fullName] = d;
        docs.splice(index - removedSoFar, 1);
        removedSoFar++;
      }
      if (d.children) {
        recurse(d.children, false);
      }
    });
  };
  recurse(Object.values(input), true);
};
