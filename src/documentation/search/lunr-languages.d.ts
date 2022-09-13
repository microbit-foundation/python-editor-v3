/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
declare module "@microbit/lunr-languages/lunr.stemmer.support";
declare module "@microbit/lunr-languages/tinyseg";
declare module "@microbit/lunr-languages/lunr.multi";

declare module "@microbit/lunr-languages/lunr.*" {
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
  export const es: LanguagePlugin;
  export const fr: LanguagePlugin;
  export const ja: LanguagePlugin;
  export const ko: LanguagePlugin;
}
