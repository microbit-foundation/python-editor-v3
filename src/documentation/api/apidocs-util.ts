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
import { JACDAC_MODULES } from "../../jacdac/python/module-source";

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

/**
 * Merge the per-sensor Jacdac modules into a single synthetic "Jacdac" module
 * for display in the API tab. The runtime modules/stubs stay separate (this is
 * display only). Children keep their real ids/fullNames (e.g.
 * "jacdac_button.jacdac_button") so the autocomplete "API" deep-links still
 * resolve — see resolveModule's child fallback below.
 */
export const mergeJacdacModules = (input: ApiDocsContent) => {
  const children: ApiDocsEntry[] = [];
  let present = false;
  for (const { className } of JACDAC_MODULES) {
    const module = input.content[className];
    if (module) {
      present = true;
      children.push(...(module.children ?? []));
      delete input.content[className];
    }
  }
  if (present) {
    input.content["Jacdac"] = {
      id: "Jacdac",
      name: "Jacdac",
      fullName: "Jacdac",
      kind: "module",
      docString: "Jacdac plug-and-play sensors, addressed by role name.",
      children,
    };
  }
};

export const resolveModule = (
  docs: ApiDocsResponse,
  name: string
): ApiDocsEntry | undefined => {
  const modules = Object.values(docs);
  const direct = modules
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
  if (direct) {
    return direct;
  }
  // Fallback for grouped modules (e.g. the synthetic "Jacdac"): match a module
  // by one of its children, so deep-links to child symbols like
  // "jacdac_button.jacdac_button.is_pressed" resolve to the group.
  return modules.find((module) =>
    module.children?.some(
      (child) =>
        name === child.fullName || name.startsWith(child.fullName + ".")
    )
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
