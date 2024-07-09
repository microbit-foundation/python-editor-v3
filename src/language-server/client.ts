/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  CompletionItem,
  CompletionList,
  CompletionParams,
  CompletionRequest,
  Diagnostic,
  DiagnosticSeverity,
  DiagnosticTag,
  DidChangeTextDocumentNotification,
  DidCloseTextDocumentNotification,
  DidCloseTextDocumentParams,
  DidOpenTextDocumentNotification,
  InitializedNotification,
  InitializeParams,
  InitializeRequest,
  LogMessageNotification,
  MessageConnection,
  PublishDiagnosticsNotification,
  PublishDiagnosticsParams,
  RegistrationRequest,
  ServerCapabilities,
  TextDocumentContentChangeEvent,
  TextDocumentItem,
} from "vscode-languageserver-protocol";
import { retryAsyncLoad } from "../common/chunk-util";
import { microPythonConfig } from "../micropython/micropython";
import {
  isErrorDueToDispose,
  OfflineError,
  showOfflineLanguageToast,
} from "./error-util";
import { fallbackLocale } from "../settings/settings";
import { CreateToastFnReturn } from "@chakra-ui/react";
import { TypedEventTarget } from "../common/events";

/**
 * Create a URI for a source document under the default root of file:///src/.
 */
export const createUri = (name: string) => `file:///src/${name}`;

export class DiagnosticsEvent extends Event {
  constructor(public readonly detail: PublishDiagnosticsParams) {
    super("diagnostics");
  }
}

class EventMap {
  "diagnostics": DiagnosticsEvent;
}

/**
 * Owns the connection.
 *
 * Exposes methods for the core text document notifications from
 * client to server for the app to implement.
 *
 * Tracks and exposes the diagnostics.
 */
export class LanguageServerClient extends TypedEventTarget<EventMap> {
  /**
   * The capabilities of the server we're connected to.
   * Populated after initialize.
   */
  capabilities: ServerCapabilities | undefined;
  private versions: Map<string, number> = new Map();
  private diagnostics: Map<string, Diagnostic[]> = new Map();
  private initializePromise: Promise<boolean> | undefined;

  constructor(
    public connection: MessageConnection,
    public locale: string,
    public rootUri: string,
    private toast: CreateToastFnReturn
  ) {
    super();
  }

  currentDiagnostics(uri: string): Diagnostic[] {
    return this.diagnostics.get(uri) ?? [];
  }

  allDiagnostics(): Diagnostic[] {
    return Array.from(this.diagnostics.values()).flat();
  }

  errorCount(): number {
    return this.allDiagnostics().filter(
      (e) => e.severity === DiagnosticSeverity.Error
    ).length;
  }

  /**
   * Initialize or wait for in-progress initialization.
   */
  async initialize(): Promise<boolean> {
    if (this.initializePromise) {
      return this.initializePromise;
    }
    this.initializePromise = (async () => {
      try {
        this.connection.onNotification(LogMessageNotification.type, (params) =>
          console.log("[LS]", params.message)
        );

        this.connection.onNotification(
          PublishDiagnosticsNotification.type,
          (params) => {
            this.diagnostics.set(params.uri, params.diagnostics);
            // Republish as you can't listen twice.
            this.dispatchTypedEvent(
              "diagnostics",
              new DiagnosticsEvent(params)
            );
          }
        );
        this.connection.onRequest(RegistrationRequest.type, () => {
          // Ignore. I don't think we should get these at all given our
          // capabilities, but Pyright is sending one anyway.
        });

        const initializeParams: InitializeParams = {
          locale: this.locale,
          capabilities: {
            textDocument: {
              moniker: {},
              synchronization: {
                willSave: false,
                didSave: false,
                willSaveWaitUntil: false,
              },
              completion: {
                completionItem: {
                  snippetSupport: false,
                  commitCharactersSupport: true,
                  documentationFormat: ["markdown"],
                  deprecatedSupport: false,
                  preselectSupport: false,
                },
                contextSupport: true,
              },
              signatureHelp: {
                signatureInformation: {
                  documentationFormat: ["markdown"],
                  activeParameterSupport: true,
                  parameterInformation: {
                    labelOffsetSupport: true,
                  },
                },
              },
              publishDiagnostics: {
                tagSupport: {
                  valueSet: [
                    DiagnosticTag.Unnecessary,
                    DiagnosticTag.Deprecated,
                  ],
                },
              },
            },
            workspace: {
              workspaceFolders: true,
              didChangeConfiguration: {},
              configuration: true,
            },
          },
          initializationOptions: await this.getInitializationOptions(),
          processId: null,
          // Do we need both of these?
          rootUri: this.rootUri,
          workspaceFolders: [
            {
              name: "src",
              uri: this.rootUri,
            },
          ],
        };
        const { capabilities } = await this.connection.sendRequest(
          InitializeRequest.type,
          initializeParams
        );
        this.capabilities = capabilities;
        this.connection.sendNotification(InitializedNotification.type, {});
      } catch (e) {
        if (isErrorDueToDispose(e)) {
          // We've intentionally disposed the connection because we're recreating the client.
          // This mostly happens due to React 18 strict mode but could happen due to language changes.
          return false;
        }
        if (!navigator.onLine) {
          showOfflineLanguageToast(this.toast);
          // Fallback to the precached locale if user is offline.
          this.locale = fallbackLocale;
          this.initializePromise = undefined;
          this.initialize();
        } else {
          throw e;
        }
      }
      return true;
    })();
    return this.initializePromise;
  }

  private async getInitializationOptions(): Promise<any> {
    const branch = microPythonConfig.stubs;
    let typeshed;
    try {
      typeshed = await retryAsyncLoad(() => {
        return import(`../micropython/${branch}/typeshed.${this.locale}.json`);
      });
    } catch (err) {
      if (err instanceof OfflineError) {
        showOfflineLanguageToast(this.toast);
        typeshed = await import(
          `../micropython/${branch}/typeshed.${fallbackLocale}.json`
        );
      } else {
        throw err;
      }
    }
    return {
      // Shallow copy as it's an ESM that can't be serialized
      files: { files: typeshed.files },
      // Custom option in our Pyright version
      diagnosticStyle: "simplified",
    };
  }

  didOpenTextDocument(params: {
    textDocument: Omit<TextDocumentItem, "version">;
  }): void {
    this.connection.sendNotification(DidOpenTextDocumentNotification.type, {
      textDocument: {
        ...params.textDocument,
        version: this.nextVersion(params.textDocument.uri),
      },
    });
  }

  // We close Python files that are deleted. We never write to the file system,
  // so that way they're effectively deleted.
  didCloseTextDocument(params: DidCloseTextDocumentParams): void {
    this.connection.sendNotification(
      DidCloseTextDocumentNotification.type,
      params
    );
  }

  didChangeTextDocument(
    uri: string,
    contentChanges: TextDocumentContentChangeEvent[]
  ): void {
    this.connection.sendNotification(DidChangeTextDocumentNotification.type, {
      textDocument: {
        uri,
        version: this.nextVersion(uri),
      },
      contentChanges,
    });
  }

  async completionRequest(params: CompletionParams): Promise<CompletionList> {
    let results: CompletionList | CompletionItem[] | null = null;
    try {
      results = await this.connection.sendRequest(
        CompletionRequest.type,
        params
      );
    } catch (e) {
      if (!isErrorDueToDispose(e)) {
        throw e;
      }
    }
    if (!results) {
      // Not clear how this should be handled.
      return { items: [], isIncomplete: true };
    }
    return "items" in results
      ? results
      : { items: results, isIncomplete: true };
  }

  dispose() {
    this.connection.dispose();
  }

  private nextVersion(uri: string): number {
    const version = (this.versions.get(uri) ?? 0) + 1;
    this.versions.set(uri, version);
    return version;
  }
}
