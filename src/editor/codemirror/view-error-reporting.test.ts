/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { EditorState } from "@codemirror/state";
import { Decoration, EditorView, ViewPlugin } from "@codemirror/view";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MockLogging } from "../../logging/mock";
import { ViewErrorReporting } from "./view-error-reporting";

let failRedraw: Error | undefined;
let failPlugin: Error | undefined;

// Evaluated inside EditorView.update after the state has been applied, so
// throwing here leaves the view out of step, like the tile bugs do.
const explosiveDecorations = EditorView.decorations.of(() => {
  if (failRedraw) {
    throw failRedraw;
  }
  return Decoration.none;
});

// Plugin update errors are caught by CodeMirror and sent to the exception sink.
const explosivePlugin = ViewPlugin.define(() => ({
  update() {
    if (failPlugin) {
      throw failPlugin;
    }
  },
}));

describe("ViewErrorReporting", () => {
  let logging: MockLogging;
  let view: EditorView;

  beforeEach(() => {
    failRedraw = undefined;
    failPlugin = undefined;
    logging = new MockLogging();
    const reporting = new ViewErrorReporting(logging);
    view = new EditorView({
      state: EditorState.create({
        doc: "abc",
        extensions: [
          reporting.extension(),
          explosiveDecorations,
          explosivePlugin,
        ],
      }),
      parent: document.body,
      dispatchTransactions: reporting.dispatchTransactions,
    });
  });

  afterEach(() => {
    view.destroy();
  });

  it("reports an update failure with context instead of rethrowing", () => {
    failRedraw = new Error("Right side of assignment cannot be destructured");

    expect(() =>
      view.dispatch({
        changes: { from: 0, insert: "x" },
        userEvent: "input.type",
      })
    ).not.toThrow();

    expect(view.state.doc.toString()).toEqual("xabc");
    expect(logging.errors).toHaveLength(1);
    const { message, e, context } = logging.errors[0];
    expect(message).toEqual("CodeMirror update failed");
    expect(e).toBe(failRedraw);
    expect(context).toMatchObject({
      phase: "update",
      stateAdvanced: true,
      startDocLength: 3,
      docLength: 4,
      userEvents: "input.type",
      changes: "0-0+1",
      effects: 0,
    });
    expect(context).toHaveProperty("tileLength");
    expect(context).toHaveProperty("composing", false);
  });

  it("reports exceptions CodeMirror catches itself", () => {
    failPlugin = new Error("plugin crashed");

    view.dispatch({ selection: { anchor: 1 } });

    expect(logging.errors).toHaveLength(1);
    expect(logging.errors[0]).toMatchObject({
      message: "CodeMirror logged exception",
      e: failPlugin,
    });
    expect(logging.errors[0].context).toMatchObject({
      phase: "logged",
      docLength: 3,
      selectionHead: 1,
    });
  });

  it("includes recent input events without typed characters", () => {
    view.contentDOM.dispatchEvent(
      new Event("compositionstart", { bubbles: true })
    );
    view.contentDOM.dispatchEvent(
      new KeyboardEvent("keydown", { key: "a", bubbles: true })
    );
    view.contentDOM.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Backspace", bubbles: true })
    );
    view.contentDOM.dispatchEvent(
      new KeyboardEvent("keydown", { key: "\u{1F600}", bubbles: true })
    );
    view.contentDOM.dispatchEvent(
      new KeyboardEvent("keydown", { key: "A", bubbles: true })
    );
    failPlugin = new Error("plugin crashed");
    view.dispatch({ selection: { anchor: 1 } });

    const recentInput = logging.errors[0].context?.recentInput as string;
    expect(recentInput).toMatch(/compositionstart-\d+ms/);
    expect(recentInput).toMatch(/keydown:char-\d+ms/);
    expect(recentInput).toMatch(/keydown:Backspace-\d+ms/);
    expect(recentInput).not.toContain("keydown:a");
    expect(recentInput).not.toContain("\u{1F600}");
    expect(recentInput).not.toContain("keydown:A");
    expect(recentInput.match(/keydown:char/g)).toHaveLength(3);
    expect(logging.errors[0].context).not.toHaveProperty("language");
  });
});
