/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
declare module "lunr-languages/lunr.stemmer.support";
declare module "lunr-languages/tinyseg";
declare module "lunr-languages/lunr.multi";

declare module "lunr-languages/lunr.*" {
  import lunr from "lunr";
  function register(l: typeof lunr): void;
  export = register;
}
