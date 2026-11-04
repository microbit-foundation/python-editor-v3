/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import circuitPython from "./typeshed.json";

const commonPythonModules = new Set([
  "abc",
  "array",
  "builtins",
  "collections",
  "errno",
  "gc",
  "math",
  "os",
  "random",
  "struct",
  "sys",
  "types",
  "typing",
  "typing_extensions",
  "_typeshed",
]);
const moduleName = (path: string) =>
  path
    .replace("/typeshed/stdlib/", "")
    .split("/")[0]
    .replace(/\.pyi$/, "");

/** Retain Python's common types, replacing micro:bit APIs with CircuitPython. */
export const circuitPythonTypeshed = (base: Record<string, string>) => {
  const replacements = new Set(
    Object.keys(circuitPython.files).map(moduleName)
  );
  const files: Record<string, string> = {};
  for (const [path, source] of Object.entries(base)) {
    const module = moduleName(path);
    if (
      path.startsWith("/typeshed/stdlib/") &&
      commonPythonModules.has(module) &&
      !replacements.has(module)
    )
      files[path] = source;
  }
  for (const [path, source] of Object.entries(circuitPython.files)) {
    const isLibrary = circuitPython.libraryModules.includes(moduleName(path));
    files[
      isLibrary
        ? path.replace("/typeshed/stdlib/", "/circuitpython-libraries/")
        : path
    ] = source;
  }
  const modules = [
    ...new Set(
      Object.keys(files)
        .filter((path) => path.startsWith("/typeshed/stdlib/"))
        .map(moduleName)
    ),
  ].sort();
  files["/typeshed/stdlib/VERSIONS"] = modules
    .map((module) => `${module}: 3.0-`)
    .join("\n");
  files["/src/pyrightconfig.json"] = JSON.stringify({
    pythonVersion: "3.10",
    pythonPlatform: "Linux",
    typeCheckingMode: "basic",
    typeshedPath: "/typeshed/",
    extraPaths: ["/src/lib", "/circuitpython-libraries"],
    reportMissingModuleSource: false,
    reportWildcardImportFromLibrary: false,
  });
  return files;
};
