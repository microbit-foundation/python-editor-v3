/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { CompletionContext, CompletionResult } from "@codemirror/autocomplete";
import { python } from "@codemirror/lang-python";
import {
  EditorState,
  EditorSelection,
  Extension,
  TransactionSpec,
} from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { createIntl } from "react-intl";
import { MockedFunction, vi } from "vitest";
import {
  CompletionItem,
  CompletionItemKind,
  CompletionTriggerKind,
} from "vscode-languageserver-protocol";
import { LanguageServerClient } from "../../../language-server/client";
import { Logging } from "../../../logging/logging";
import { createCompletionSource } from "./autocompletion";
import { clientFacet, uriFacet } from "./common";

const intl = createIntl({ locale: "en", messages: {} });

const createLogging = (): Logging => ({
  event: vi.fn(),
  error: vi.fn(),
  log: vi.fn(),
});

const createClient = (
  items: CompletionItem[] = [],
  capabilities: {} | undefined = {
    completionProvider: { triggerCharacters: ["."] },
  }
): LanguageServerClient =>
  ({
    capabilities,
    completionRequest: vi
      .fn()
      .mockResolvedValue({ isIncomplete: false, items }),
    connection: { sendRequest: vi.fn() },
  } as unknown as LanguageServerClient);

const completionRequestMock = (client: LanguageServerClient) =>
  client.completionRequest as unknown as MockedFunction<
    LanguageServerClient["completionRequest"]
  >;

/**
 * The cursor position is marked with █, following edits.test.ts.
 */
const createContext = (
  docWithCursor: string,
  {
    explicit = false,
    client = createClient(),
    extraExtensions = [],
  }: {
    explicit?: boolean;
    client?: LanguageServerClient | null;
    extraExtensions?: Extension[];
  } = {}
): CompletionContext => {
  const pos = docWithCursor.indexOf("█");
  const doc = docWithCursor.replace("█", "");
  const state = EditorState.create({
    doc,
    selection: EditorSelection.single(pos),
    extensions: [
      python(),
      client ? clientFacet.of(client) : [],
      uriFacet.of("file:///src/main.py"),
      ...extraExtensions,
    ],
  });
  return new CompletionContext(state, pos, explicit);
};

const source = createCompletionSource(intl, createLogging(), {});

describe("createCompletionSource", () => {
  it("returns null without a client", async () => {
    expect(await source(createContext("dis█", { client: null }))).toBeNull();
  });

  it("returns null when the server has no completion capability", async () => {
    const client = createClient([], {});
    expect(await source(createContext("dis█", { client }))).toBeNull();
    expect(completionRequestMock(client)).not.toHaveBeenCalled();
  });

  it("triggers as invoked when typing an identifier", async () => {
    const client = createClient();
    const result = await source(createContext("dis█", { client }));
    expect(result).not.toBeNull();
    // Completion applies from the start of the identifier.
    expect(result!.from).toEqual(0);
    expect(completionRequestMock(client)).toHaveBeenCalledWith({
      textDocument: { uri: "file:///src/main.py" },
      position: { line: 0, character: 3 },
      context: {
        triggerKind: CompletionTriggerKind.Invoked,
        triggerCharacter: undefined,
      },
    });
  });

  it("triggers as invoked for explicit requests", async () => {
    const client = createClient();
    const result = await source(createContext("█", { client, explicit: true }));
    expect(result).not.toBeNull();
    expect(result!.from).toEqual(0);
    expect(
      completionRequestMock(client).mock.calls[0][0].context?.triggerKind
    ).toEqual(CompletionTriggerKind.Invoked);
  });

  it("triggers on trigger characters", async () => {
    const client = createClient();
    const result = await source(createContext("display.█", { client }));
    expect(result).not.toBeNull();
    expect(result!.from).toEqual(8);
    expect(completionRequestMock(client).mock.calls[0][0].context).toEqual({
      triggerKind: CompletionTriggerKind.TriggerCharacter,
      triggerCharacter: ".",
    });
  });

  it("returns null when there is nothing to trigger on", async () => {
    const client = createClient();
    expect(await source(createContext("display █", { client }))).toBeNull();
    expect(completionRequestMock(client)).not.toHaveBeenCalled();
  });

  it("filters out completions with additional text edits", async () => {
    const client = createClient([
      { label: "one", data: {} },
      {
        label: "two",
        data: {},
        additionalTextEdits: [
          {
            range: {
              start: { line: 0, character: 0 },
              end: { line: 0, character: 0 },
            },
            newText: "import radio\n",
          },
        ],
      },
    ]);
    const result = await source(createContext("█", { client, explicit: true }));
    expect(result!.options.map((o) => o.label)).toEqual(["one"]);
  });

  it("orders by sortText falling back to label", async () => {
    const client = createClient([
      { label: "b", data: {}, sortText: "2" },
      { label: "a", data: {}, sortText: "3" },
      { label: "c", data: {}, sortText: "1" },
      { label: "d", data: {} },
    ]);
    const result = await source(createContext("█", { client, explicit: true }));
    expect(result!.options.map((o) => o.label)).toEqual(["c", "b", "a", "d"]);
  });

  it("maps completion item kinds to CodeMirror types", async () => {
    const client = createClient([
      { label: "scroll", data: {}, kind: CompletionItemKind.Function },
      { label: "clear", data: {}, kind: CompletionItemKind.Method },
      { label: "button_a", data: {}, kind: CompletionItemKind.Variable },
      { label: "unspecified", data: {} },
    ]);
    const result = await source(createContext("█", { client, explicit: true }));
    expect(result!.options.map((o) => o.type)).toEqual([
      "variable",
      "method",
      "function",
      undefined,
    ]);
  });

  it("demotes dunder and keyword-argument completions", async () => {
    const client = createClient([
      { label: "__init__", data: {} },
      { label: "image=", data: {} },
      { label: "Image", data: {} },
    ]);
    const result = await source(createContext("█", { client, explicit: true }));
    const boosts = new Map(result!.options.map((o) => [o.label, o.boost]));
    expect(boosts.get("__init__")).toEqual(-99);
    // The magnitude is coupled to @codemirror/autocomplete's ranking; see boost().
    expect(boosts.get("image=")).toBeLessThanOrEqual(-200);
    expect(boosts.get("Image")).toBeUndefined();
  });

  describe("apply", () => {
    const applyOption = async (
      docWithCursor: string,
      items: CompletionItem[]
    ) => {
      const logging = createLogging();
      const source = createCompletionSource(intl, logging, {});
      const client = createClient(items);
      const context = createContext(docWithCursor, { client });
      const result = (await source(context)) as CompletionResult;
      const option = result.options[0];
      let state = context.state;
      const view = {
        get state() {
          return state;
        },
        dispatch: (...specs: TransactionSpec[]) => {
          state = state.update(...specs).state;
        },
      } as unknown as EditorView;
      if (typeof option.apply !== "function") {
        throw new Error("Expected a function apply");
      }
      option.apply(view, option, result.from, context.pos);
      return { state, logging };
    };

    it("inserts the label", async () => {
      const { state, logging } = await applyOption("but█", [
        { label: "button_a", data: {}, kind: CompletionItemKind.Variable },
      ]);
      expect(state.doc.toString()).toEqual("button_a");
      expect(state.selection.main.from).toEqual("button_a".length);
      expect(logging.event).toHaveBeenCalledWith({
        type: "autocomplete-accept",
      });
    });

    it("inserts brackets for functions with the cursor between them", async () => {
      const { state } = await applyOption("sle█", [
        { label: "sleep", data: {}, kind: CompletionItemKind.Function },
      ]);
      expect(state.doc.toString()).toEqual("sleep()");
      expect(state.selection.main.from).toEqual("sleep(".length);
    });

    it("inserts brackets for methods", async () => {
      const { state } = await applyOption("display.scr█", [
        { label: "scroll", data: {}, kind: CompletionItemKind.Method },
      ]);
      expect(state.doc.toString()).toEqual("display.scroll()");
      expect(state.selection.main.from).toEqual("display.scroll(".length);
    });

    it("skips brackets when Pyright disables them", async () => {
      // Pyright sets funcParensDisabled for e.g. function completions in imports.
      const { state } = await applyOption("from microbit import sle█", [
        {
          label: "sleep",
          data: { funcParensDisabled: true },
          kind: CompletionItemKind.Function,
        },
      ]);
      expect(state.doc.toString()).toEqual("from microbit import sleep");
    });
  });
});
