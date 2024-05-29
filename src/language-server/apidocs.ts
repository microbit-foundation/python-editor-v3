/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ProtocolRequestType } from "vscode-languageserver-protocol";
import { MarkupKind } from "vscode-languageserver-types";
import { LanguageServerClient } from "./client";
import { isErrorDueToDispose } from "./error-util";

// This duplicates the types we added to Pyright.

export interface ApiDocsParams {
  modules: string[];
  path: string;
  documentationFormat?: MarkupKind[];
}

export interface ApiDocsBaseClass {
  name: string;
  fullName: string;
}

export type ApiDocsFunctionParameterCategory =
  | "simple"
  | "varargList"
  | "varargDict";

export interface ApiDocsFunctionParameter {
  name: string;
  category: ApiDocsFunctionParameterCategory;
  defaultValue?: string;
}

export interface ApiDocsEntry {
  id: string;
  name: string;
  docString?: string;
  fullName: string;
  type?: string;
  kind: "function" | "module" | "class" | "variable";
  children?: ApiDocsEntry[];
  baseClasses?: ApiDocsBaseClass[];
  params?: ApiDocsFunctionParameter[];
}

export interface ApiDocsContent {
  languageId: string;
  content: ApiDocsResponse;
}

export interface ApiDocsResponse extends Record<string, ApiDocsEntry> {}

export const apiDocsRequestType = new ProtocolRequestType<
  ApiDocsParams,
  ApiDocsResponse,
  never,
  void,
  void
>("pyright/apidocs");

export const apiDocs = async (
  client: LanguageServerClient
): Promise<ApiDocsContent> => {
  // This is a non-standard LSP call that we've added support for to Pyright.
  try {
    const content = await client.connection.sendRequest(apiDocsRequestType, {
      path: client.rootUri,
      documentationFormat: [MarkupKind.Markdown],
      modules: [
        // For now, this omits a lot of modules that have stubs
        // derived from typeshed with no docs.
        // Note: "audio" is covered under micro:bit.
        "gc",
        "log",
        "machine",
        "math",
        "microbit",
        "micropython",
        "music",
        "neopixel",
        "os",
        "power",
        "radio",
        "random",
        "speech",
        "struct",
        "sys",
        "time",
      ],
    });
    return { content, languageId: client.locale };
  } catch (e) {
    if (isErrorDueToDispose(e)) {
      return { content: {}, languageId: client.locale };
    }
    throw e;
  }
};
