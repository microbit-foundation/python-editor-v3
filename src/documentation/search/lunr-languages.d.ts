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

declare namespace lunr {
  import { Builder } from "lunr";
  export function multiLanguage(...lang: string[]): Builder.Plugin;

  // Add more here.
  // I don't think we can use module augmentation—lunr is a namespace.
  export const es: Builder.Plugin;
  export const fr: Builder.Plugin;
  export const ja: Builder.Plugin;
  export const zh: Builder.Plugin;
}
