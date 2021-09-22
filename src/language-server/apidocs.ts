import { LanguageServerClient } from "./client";

export interface BaseClassDetails {
  name: string;
  fullName: string;
}

export interface DocEntry {
  id: string;
  name: string;
  docString?: string;
  fullName: string;
  type?: string;
  kind: "function" | "module" | "class" | "variable";
  children?: DocEntry[];
  baseClasses?: BaseClassDetails[];
}

export interface ApiDocsResponse extends Record<string, DocEntry> {}

export const apiDocs = (
  client: LanguageServerClient
): Promise<ApiDocsResponse> => {
  // This is a non-standard LSP call that we've added support for to Pyright.
  return client.connection.sendRequest("pyright/apidocs", {
    path: client.options.rootUri,
    modules: [
      // For now, this omits a lot of modules that aren't documented
      // in the readthedocs documentation. We could add them, but I
      // think we'd need some progressive disclosure UX.
      // Need to consider e.g. urandom vs random and perhaps move
      // the stubs to the primary file.
      "audio",
      "machine",
      "math",
      "microbit",
      "micropython",
      "music",
      "neopixel",
      "os",
      "radio",
      "speech",
      "urandom",
      "utime",
    ],
  });
};
