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

  interface LanguagePlugin extends Builder.Plugin {
    tokenizer?: (
      obj?: string | object | object[] | null | undefined
    ) => lunr.Token[];
  }

  export function multiLanguage(...lang: string[]): Builder.Plugin;

  // Add more here.
  // I don't think we can use module augmentation—lunr is a namespace.
  export const de: LanguagePlugin;
  export const es: LanguagePlugin;
  export const fr: LanguagePlugin;
  export const ja: LanguagePlugin;
  export const ko: LanguagePlugin;
  export const nl: LanguagePlugin;
}
