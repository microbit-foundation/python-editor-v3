/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
type Product = "microbitV1" | "microbitV2";

export interface HasCompatibility {
  compatibility: Product[];
}

// Although the data model is more flexible, in the UI we just want to
// show a V2 marker for newer board features.
export const isV2Only = (compatible: HasCompatibility) => {
  return (
    // This will be defined everywhere shortly, but for now we need to cope before the migration.
    compatible.compatibility &&
    compatible.compatibility.length === 1 &&
    compatible.compatibility[0] === "microbitV2"
  );
};
