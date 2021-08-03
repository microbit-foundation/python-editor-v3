/**
 * Fork of
 * https://github.com/FurqanSoftware/codemirror-languageserver/blob/master/src/index.ts
 * for quick experimentation.
 *
 * SPDX-License-Identifier: BSD 3-Clause
 */

//

// Copyright (c) 2021, Mahmud Ridwan
//
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// * Redistributions of source code must retain the above copyright notice, this
//   list of conditions and the following disclaimer.
//
// * Redistributions in binary form must reproduce the above copyright notice,
//   this list of conditions and the following disclaimer in the documentation
//   and/or other materials provided with the distribution.
//
// * Neither the name of the library nor the names of its
//   contributors may be used to endorse or promote products derived from
//   this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
// FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
// DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
// OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

import type {
  Completion,
  CompletionContext,
  CompletionResult,
} from "@codemirror/autocomplete";
import { autocompletion } from "@codemirror/autocomplete";
import { setDiagnostics } from "@codemirror/lint";
import type { Text } from "@codemirror/state";
import { Facet } from "@codemirror/state";
import type { Tooltip } from "@codemirror/tooltip";
import { hoverTooltip } from "@codemirror/tooltip";
import type { PluginValue, ViewUpdate } from "@codemirror/view";
import { EditorView, ViewPlugin } from "@codemirror/view";
import { Client, RequestManager } from "@open-rpc/client-js";
import { IJSONRPCNotification } from "@open-rpc/client-js/build/Request";
import { Transport } from "@open-rpc/client-js/build/transports/Transport";
import type * as LSP from "vscode-languageserver-protocol";
import {
  DiagnosticTag,
  LogMessageParams,
  PublishDiagnosticsParams,
} from "vscode-languageserver-protocol";
import {
  CompletionItemKind,
  CompletionTriggerKind,
  DiagnosticSeverity,
} from "vscode-languageserver-protocol";

const timeout = 10000;
const changesDelay = 500;

const CompletionItemKindMap = Object.fromEntries(
  Object.entries(CompletionItemKind).map(([key, value]) => [value, key])
) as Record<CompletionItemKind, string>;

const useLast = (values: readonly string[]) => values.reduce((_, v) => v, "");

const rootUri = Facet.define<string, string>({ combine: useLast });
const documentUri = Facet.define<string, string>({ combine: useLast });
const languageId = Facet.define<string, string>({ combine: useLast });

// https://microsoft.github.io/language-server-protocol/specifications/specification-current/

// Client to server then server to client
interface LSPRequestMap {
  initialize: [LSP.InitializeParams, LSP.InitializeResult];
  "textDocument/hover": [LSP.HoverParams, LSP.Hover];
  "textDocument/completion": [
    LSP.CompletionParams,
    LSP.CompletionItem[] | LSP.CompletionList | null
  ];
}

// Client to server
interface LSPNotifyMap {
  initialized: LSP.InitializedParams;
  "textDocument/didChange": LSP.DidChangeTextDocumentParams;
  "textDocument/didOpen": LSP.DidOpenTextDocumentParams;
  "pyright/bootstrapFileSystem": { files: Record<string, string> };
}

// Server to client
interface LSPEventMap {
  "textDocument/publishDiagnostics": LSP.PublishDiagnosticsParams;
  "window/logMessage": LSP.LogMessageParams;
}

type Notification = {
  [key in keyof LSPEventMap]: {
    jsonrpc: "2.0";
    id?: null | undefined;
    method: key;
    params: LSPEventMap[key];
  };
}[keyof LSPEventMap];

class LanguageServerPlugin implements PluginValue {
  private rootUri: string;
  private documentUri: string;
  private languageId: string;
  private documentVersion: number;
  private requestManager: RequestManager;
  private client: Client;
  private changesTimeout: number;
  private ready?: boolean;
  private diagnostics: LSP.Diagnostic[] | undefined;
  public capabilities?: LSP.ServerCapabilities<any>;

  constructor(private view: EditorView, private transport: Transport) {
    this.rootUri = this.view.state.facet(rootUri);
    this.documentUri = this.view.state.facet(documentUri);
    this.languageId = this.view.state.facet(languageId);
    this.documentVersion = 0;
    this.changesTimeout = 0;
    this.requestManager = new RequestManager([this.transport]);
    this.client = new Client(this.requestManager);
    this.client.onNotification((data: IJSONRPCNotification) => {
      this.processNotification(data as any);
    });
    this.initialize({
      documentText: this.view.state.doc.toString(),
    });
  }

  update({ docChanged }: ViewUpdate) {
    if (!docChanged) return;
    if (this.changesTimeout) clearTimeout(this.changesTimeout);
    /* eslint-disable no-restricted-globals */
    this.changesTimeout = self.setTimeout(() => {
      this.sendChange({
        documentText: this.view.state.doc.toString(),
      });
    }, changesDelay);
  }

  destroy() {
    this.client.close();
  }

  private request<K extends keyof LSPRequestMap>(
    method: K,
    params: LSPRequestMap[K][0],
    timeout: number
  ): Promise<LSPRequestMap[K][1]> {
    return this.client.request({ method, params }, timeout);
  }

  private notify<K extends keyof LSPNotifyMap>(
    method: K,
    params: LSPNotifyMap[K]
  ): Promise<LSPNotifyMap[K]> {
    return this.client.notify({ method, params });
  }

  async initialize({ documentText }: { documentText: string }) {
    // Must bootstrap before the initialize request so that the config file is in place.
    // Is this legit LSP? Otherwise we need a way to reconfigure.
    this.notify(
      "pyright/bootstrapFileSystem",
      await import("./typeshed.json")
    );

    const { capabilities } = await this.request(
      "initialize",
      {
        capabilities: {
          textDocument: {
            hover: {
              dynamicRegistration: true,
              contentFormat: ["plaintext", "markdown"],
            },
            moniker: {},
            synchronization: {
              dynamicRegistration: true,
              willSave: false,
              didSave: false,
              willSaveWaitUntil: false,
            },
            completion: {
              dynamicRegistration: true,
              completionItem: {
                snippetSupport: false,
                commitCharactersSupport: true,
                documentationFormat: ["plaintext", "markdown"],
                deprecatedSupport: false,
                preselectSupport: false,
              },
              contextSupport: false,
            },
            signatureHelp: {
              dynamicRegistration: true,
              signatureInformation: {
                documentationFormat: ["plaintext", "markdown"],
              },
            },
            declaration: {
              dynamicRegistration: true,
              linkSupport: true,
            },
            definition: {
              dynamicRegistration: true,
              linkSupport: true,
            },
            typeDefinition: {
              dynamicRegistration: true,
              linkSupport: true,
            },
            implementation: {
              dynamicRegistration: true,
              linkSupport: true,
            },
            publishDiagnostics: {
              tagSupport: {
                valueSet: [DiagnosticTag.Unnecessary, DiagnosticTag.Deprecated],
              },
            },
          },
          workspace: {
            workspaceFolders: true,
            didChangeConfiguration: {
              dynamicRegistration: true,
            },
          },
        },
        initializationOptions: null,
        processId: null,
        rootUri: this.rootUri,
        workspaceFolders: [
          {
            name: "src",
            uri: this.rootUri,
          },
        ],
      },
      timeout * 3
    );
    this.capabilities = capabilities;
    this.notify("initialized", {});
    this.notify("textDocument/didOpen", {
      textDocument: {
        uri: this.documentUri,
        languageId: this.languageId,
        text: documentText,
        version: this.documentVersion,
      },
    });
    this.ready = true;
  }

  async sendChange({ documentText }: { documentText: string }) {
    if (!this.ready) return;
    try {
      await this.notify("textDocument/didChange", {
        textDocument: {
          uri: this.documentUri,
          version: this.documentVersion++,
        },
        contentChanges: [{ text: documentText }],
      });
    } catch (e) {
      console.error(e);
    }
  }

  requestDiagnostics(view: EditorView) {
    this.sendChange({ documentText: view.state.doc.toString() });
  }

  async requestHoverTooltip(
    view: EditorView,
    position: LSP.Position
  ): Promise<Tooltip | null> {
    if (!this.ready || !this.capabilities!.hoverProvider) return null;

    if (this.isKnownUnreachable(position)) {
      // Avoid requesting hovers for unreachable code. Pyright will
      // return diagnostics that its usual notification wouldn't give.
      return null;
    }

    const { line, character } = position;
    this.sendChange({ documentText: view.state.doc.toString() });
    const result = await this.request(
      "textDocument/hover",
      {
        textDocument: { uri: this.documentUri },
        position: { line, character },
      },
      timeout
    );
    if (!result) return null;
    const { contents, range } = result;
    let pos = posToOffset(view.state.doc, { line, character })!;
    let end: number | undefined;
    if (range) {
      pos = posToOffset(view.state.doc, range.start)!;
      end = posToOffset(view.state.doc, range.end);
    }
    if (pos === null) return null;
    const dom = document.createElement("div");
    dom.classList.add("documentation");
    dom.textContent = formatContents(contents);
    // Above looks a bit poor but need to coordinate to stack with the lint ones.
    return { pos, end, create: (view) => ({ dom }), above: true };
  }

  private isKnownUnreachable(position: LSP.Position): boolean {
    return Boolean(
      this.diagnostics?.find(
        (x) =>
          x.tags &&
          x.tags?.indexOf(DiagnosticTag.Unnecessary) !== -1 &&
          inRange(x.range, position)
      )
    );
  }

  async requestCompletion(
    context: CompletionContext,
    { line, character }: { line: number; character: number },
    {
      triggerKind,
      triggerCharacter,
    }: {
      triggerKind: CompletionTriggerKind;
      triggerCharacter: string | undefined;
    }
  ): Promise<CompletionResult | null> {
    if (!this.ready || !this.capabilities!.completionProvider) return null;
    // Surely this promise should resolve? But it doesn't.
    // It seems to roughly work though but need to check the other end.
    this.sendChange({
      documentText: context.state.doc.toString(),
    });

    const result = await this.request(
      "textDocument/completion",
      {
        textDocument: { uri: this.documentUri },
        position: { line, character },
        context: {
          triggerKind,
          triggerCharacter,
        },
      },
      timeout
    );
    if (!result) return null;

    const items = "items" in result ? result.items : result;

    let options = items.map(
      ({
        detail,
        label,
        kind,
        textEdit,
        documentation,
        sortText,
        filterText,
      }) => {
        const completion: Completion & {
          filterText: string;
          sortText?: string;
          apply: string;
        } = {
          label,
          detail,
          apply: textEdit?.newText ?? label,
          type: kind && CompletionItemKindMap[kind].toLowerCase(),
          sortText: sortText ?? label,
          filterText: filterText ?? label,
        };
        if (documentation) {
          completion.info = formatContents(documentation);
        }
        return completion;
      }
    );

    const [, match] = prefixMatch(options);
    const token = context.matchBefore(match);
    let { pos } = context;

    if (token) {
      pos = token.from;
      const word = token.text.toLowerCase();
      if (/^\w+$/.test(word)) {
        options = options
          .filter(({ filterText }) => filterText.toLowerCase().startsWith(word))
          .sort(({ apply: a }, { apply: b }) => {
            switch (true) {
              case a.startsWith(token.text) && !b.startsWith(token.text):
                return -1;
              case !a.startsWith(token.text) && b.startsWith(token.text):
                return 1;
            }
            return 0;
          });
      }
    }
    return {
      from: pos,
      options,
    };
  }

  processNotification(notification: Notification) {
    try {
      switch (notification.method) {
        case "textDocument/publishDiagnostics":
          return this.processDiagnostics(notification.params);
        case "window/logMessage":
          return this.processLogMessage(notification.params);
      }
    } catch (error) {
      console.error(error);
    }
  }

  processLogMessage(params: LogMessageParams) {
    console.log("[LS]", params.message);
  }

  processDiagnostics(params: PublishDiagnosticsParams) {
    this.diagnostics = params.diagnostics;
    const diagnostics = params.diagnostics
      .map(({ range, message, severity }) => ({
        from: posToOffset(this.view.state.doc, range.start)!,
        to: posToOffset(this.view.state.doc, range.end)!,
        severity: (
          {
            [DiagnosticSeverity.Error]: "error",
            [DiagnosticSeverity.Warning]: "warning",
            [DiagnosticSeverity.Information]: "info",
            [DiagnosticSeverity.Hint]: "info",
          } as const
        )[severity!],
        message,
      }))
      .filter(
        ({ from, to }) =>
          from !== null && to !== null && from !== undefined && to !== undefined
      )
      .sort((a, b) => {
        switch (true) {
          case a.from < b.from:
            return -1;
          case a.from > b.from:
            return 1;
        }
        return 0;
      });

    this.view.dispatch(setDiagnostics(this.view.state, diagnostics));
  }
}

interface LanguageServerOptions {
  rootUri: string;
  documentUri: string;
  languageId: string;
}

export function languageServer(
  options: LanguageServerOptions,
  transport: Transport
) {
  let plugin: LanguageServerPlugin | null = null;

  return [
    rootUri.of(options.rootUri),
    documentUri.of(options.documentUri),
    languageId.of(options.languageId),
    ViewPlugin.define(
      (view) => (plugin = new LanguageServerPlugin(view, transport))
    ),
    hoverTooltip(
      (view, pos) =>
        plugin?.requestHoverTooltip(view, offsetToPos(view.state.doc, pos)) ??
        null
    ),
    autocompletion({
      override: [
        async (context) => {
          if (plugin == null) return null;

          const { state, pos, explicit } = context;
          const line = state.doc.lineAt(pos);
          let trigKind: CompletionTriggerKind = CompletionTriggerKind.Invoked;
          let trigChar: string | undefined;
          if (
            !explicit &&
            plugin.capabilities?.completionProvider?.triggerCharacters?.includes(
              line.text[pos - line.from - 1]
            )
          ) {
            trigKind = CompletionTriggerKind.TriggerCharacter;
            trigChar = line.text[pos - line.from - 1];
          }
          if (
            trigKind === CompletionTriggerKind.Invoked &&
            !context.matchBefore(/\w+$/)
          ) {
            return null;
          }
          return await plugin.requestCompletion(
            context,
            offsetToPos(state.doc, pos),
            {
              triggerKind: trigKind,
              triggerCharacter: trigChar,
            }
          );
        },
      ],
    }),
    baseTheme,
  ];
}

function posToOffset(doc: Text, pos: { line: number; character: number }) {
  if (pos.line >= doc.lines) return;
  const offset = doc.line(pos.line + 1).from + pos.character;
  if (offset > doc.length) return;
  return offset;
}

function offsetToPos(doc: Text, offset: number) {
  const line = doc.lineAt(offset);
  return {
    line: line.number - 1,
    character: offset - line.from,
  };
}

function formatContents(
  contents: LSP.MarkupContent | LSP.MarkedString | LSP.MarkedString[]
): string {
  if (Array.isArray(contents)) {
    return contents.map((c) => formatContents(c) + "\n\n").join("");
  } else if (typeof contents === "string") {
    return contents;
  } else {
    return contents.value;
  }
}

function toSet(chars: Set<string>) {
  let preamble = "";
  let flat = Array.from(chars).join("");
  const words = /\w/.test(flat);
  if (words) {
    preamble += "\\w";
    flat = flat.replace(/\w/g, "");
  }
  return `[${preamble}${flat.replace(/[^\w\s]/g, "\\$&")}]`;
}

function prefixMatch(options: Completion[]) {
  const first = new Set<string>();
  const rest = new Set<string>();

  for (const { apply } of options) {
    const [initial, ...restStr] = Array.from(apply as string);
    first.add(initial);
    for (const char of restStr) {
      rest.add(char);
    }
  }

  const source = toSet(first) + toSet(rest) + "*$";
  return [new RegExp("^" + source), new RegExp(source)];
}

function inRange(range: LSP.Range, position: LSP.Position): boolean {
  return !isBefore(position, range.start) && !isAfter(position, range.end);
}

function isBefore(p1: LSP.Position, p2: LSP.Position): boolean {
  return (
    p1.line < p2.line || (p1.line === p2.line && p1.character < p2.character)
  );
}

function isAfter(p1: LSP.Position, p2: LSP.Position): boolean {
  return (
    p1.line > p2.line || (p1.line === p2.line && p1.character > p2.character)
  );
}

const baseTheme = EditorView.baseTheme({
  ".cm-tooltip.documentation": {
    display: "block",
    marginLeft: "0",
    padding: "3px 6px 3px 8px",
    borderLeft: "5px solid #999",
    whiteSpace: "pre",
  },
  ".cm-tooltip.lint": {
    whiteSpace: "pre",
  },
});
