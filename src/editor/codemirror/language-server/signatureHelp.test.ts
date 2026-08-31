/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { EditorState } from "@codemirror/state";
import { showTooltip, Tooltip } from "@codemirror/view";
import { createIntl } from "react-intl";
import { SignatureHelp } from "vscode-languageserver-protocol";
import {
  setSignatureHelpRequestPosition,
  setSignatureHelpResult,
  signatureHelp,
} from "./signatureHelp";

const intl = createIntl({
  locale: "en",
  messages: { help: "Help", "api-tab": "API reference" },
});

const signatureHelpResult: SignatureHelp = {
  signatures: [
    {
      label: "microbit.display.scroll(text, delay=150)",
      parameters: [{ label: [24, 28] }, { label: [30, 39] }],
      activeParameter: 0,
      documentation: {
        kind: "markdown",
        value: "Scrolls text on the display.",
      },
    },
  ],
  activeSignature: 0,
};

const createState = (doc: string, automatic: boolean = true): EditorState =>
  EditorState.create({
    doc,
    extensions: [signatureHelp(intl, automatic, {})],
  });

const tooltips = (state: EditorState): Tooltip[] =>
  state.facet(showTooltip).filter((t): t is Tooltip => Boolean(t));

describe("signatureHelp", () => {
  it("shows no tooltip initially", () => {
    expect(tooltips(createState("display.scroll()"))).toEqual([]);
  });

  it("shows no tooltip for a request until the result arrives", () => {
    let state = createState("display.scroll()");
    state = state.update({
      effects: [setSignatureHelpRequestPosition.of(15)],
    }).state;
    expect(tooltips(state)).toEqual([]);

    state = state.update({
      effects: [setSignatureHelpResult.of(signatureHelpResult)],
    }).state;
    const shown = tooltips(state);
    expect(shown).toHaveLength(1);
    expect(shown[0].pos).toEqual(15);
    expect(shown[0].above).toEqual(true);
  });

  it("renders the signature with the active parameter highlighted", () => {
    let state = createState("display.scroll()");
    state = state.update({
      effects: [
        setSignatureHelpRequestPosition.of(15),
        setSignatureHelpResult.of(signatureHelpResult),
      ],
    }).state;
    const { dom } = tooltips(state)[0].create({} as never);
    expect(dom.className).toEqual("cm-signature-tooltip");
    expect(dom.querySelector("code")!.textContent).toEqual(
      // Fully qualified name trimmed for display.
      "scroll(text, delay=150)"
    );
    expect(
      dom.querySelector(".cm-signature-activeParameter")!.textContent
    ).toEqual("text");
    expect(dom.textContent).toContain("Scrolls text on the display.");
  });

  it("clears the tooltip when the result is cleared", () => {
    let state = createState("display.scroll()");
    state = state.update({
      effects: [
        setSignatureHelpRequestPosition.of(15),
        setSignatureHelpResult.of(signatureHelpResult),
      ],
    }).state;
    state = state.update({
      effects: [setSignatureHelpResult.of(null)],
    }).state;
    expect(tooltips(state)).toEqual([]);
  });

  it("clears the tooltip when the position is cleared (close command)", () => {
    let state = createState("display.scroll()");
    state = state.update({
      effects: [
        setSignatureHelpRequestPosition.of(15),
        setSignatureHelpResult.of(signatureHelpResult),
      ],
    }).state;
    state = state.update({
      effects: [setSignatureHelpRequestPosition.of(-1)],
    }).state;
    expect(tooltips(state)).toEqual([]);
  });

  it("maps the tooltip position through document changes", () => {
    let state = createState("display.scroll()");
    state = state.update({
      effects: [
        setSignatureHelpRequestPosition.of(15),
        setSignatureHelpResult.of(signatureHelpResult),
      ],
    }).state;
    state = state.update({
      changes: { from: 0, insert: "x = " },
    }).state;
    expect(tooltips(state)[0].pos).toEqual(19);
  });

  it("follows explicit selection movement, keeping the stale result", () => {
    let state = createState("display.scroll()");
    state = state.update({
      effects: [
        setSignatureHelpRequestPosition.of(15),
        setSignatureHelpResult.of(signatureHelpResult),
      ],
    }).state;
    state = state.update({ selection: { anchor: 3 } }).state;
    expect(tooltips(state)[0].pos).toEqual(3);
  });

  it("triggers automatically when typing ()", () => {
    let state = createState("display.scroll");
    state = state.update({
      changes: { from: 14, insert: "()" },
      selection: { anchor: 15 },
      userEvent: "input.type",
    }).state;
    // The view plugin would request signature help for the new position;
    // headless we just supply the result.
    state = state.update({
      effects: [setSignatureHelpResult.of(signatureHelpResult)],
    }).state;
    const shown = tooltips(state);
    expect(shown).toHaveLength(1);
    expect(shown[0].pos).toEqual(15);
  });

  it("does not trigger automatically when disabled", () => {
    let state = createState("display.scroll", false);
    state = state.update({
      changes: { from: 14, insert: "()" },
      selection: { anchor: 15 },
      userEvent: "input.type",
    }).state;
    state = state.update({
      effects: [setSignatureHelpResult.of(signatureHelpResult)],
    }).state;
    expect(tooltips(state)).toEqual([]);
  });

  it("does not trigger automatically for non-call input", () => {
    let state = createState("display.scroll");
    state = state.update({
      changes: { from: 14, insert: "x" },
      selection: { anchor: 15 },
      userEvent: "input.type",
    }).state;
    state = state.update({
      effects: [setSignatureHelpResult.of(signatureHelpResult)],
    }).state;
    expect(tooltips(state)).toEqual([]);
  });
});
