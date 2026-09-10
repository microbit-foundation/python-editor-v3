/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Extension, Transaction } from "@codemirror/state";
import { EditorView, ViewPlugin } from "@codemirror/view";
import { Logging } from "../../logging/logging";

const recentInputSize = 20;

/**
 * Reports failures inside CodeMirror's view with the context needed to
 * chase them upstream (see #1317).
 *
 * EditorView.update applies the new state before it redraws and does not
 * roll back if the redraw throws, so one exception leaves the view out of
 * step with the document and every later keystroke, click and measure
 * throws too. Sentry then sees hundreds of follow-ups that all look alike.
 * Reporting here attaches what distinguishes the first failure: the
 * transaction, document versus tile-tree length, composition state and the
 * preceding input events.
 *
 * One instance per editor. Put `extension()` in the state and pass
 * `dispatchTransactions` to the EditorView constructor.
 */
export class ViewErrorReporting {
  private view: EditorView | null = null;
  private recentInput: Array<{ kind: string; time: number }> = [];

  constructor(private logging: Logging) {}

  extension(): Extension {
    return [
      ViewPlugin.define((view) => {
        this.view = view;
        return {
          destroy: () => {
            if (this.view === view) {
              this.view = null;
            }
          },
        };
      }),
      // Exceptions CodeMirror catches itself (plugin crashes, measure reads)
      // would otherwise go straight to window.onerror without context.
      EditorView.exceptionSink.of((e) => {
        this.logging.error(
          "CodeMirror logged exception",
          e,
          this.view
            ? this.context(this.view, { phase: "logged" })
            : { phase: "logged" }
        );
      }),
      EditorView.domEventObservers({
        compositionstart: () => this.noteInput("compositionstart"),
        compositionend: () => this.noteInput("compositionend"),
        beforeinput: (e) => this.noteInput("beforeinput:" + e.inputType),
        // Named keys only (Backspace, ArrowLeft, Dead, Process...): at least
        // two characters, so a shifted capital never matches, and no astral
        // character either. Everything else is reported as "char" so no
        // typed text leaves the browser.
        keydown: (e) =>
          this.noteInput(
            "keydown:" + (/^[A-Z][A-Za-z0-9]+$/.test(e.key) ? e.key : "char")
          ),
        mousedown: () => this.noteInput("mousedown"),
      }),
    ];
  }

  /**
   * Exceptions are reported once, with context, rather than rethrown to
   * the caller of dispatch (which would report them again via onerror).
   */
  dispatchTransactions = (
    trs: readonly Transaction[],
    view: EditorView
  ): void => {
    try {
      view.update(trs);
    } catch (e) {
      const startState = trs.length > 0 ? trs[0].startState : undefined;
      this.logging.error(
        "CodeMirror update failed",
        e,
        this.context(view, {
          phase: "update",
          // The state is applied before the redraw; if it moved on, the
          // view is now inconsistent with the document.
          stateAdvanced: startState !== undefined && view.state !== startState,
          startDocLength: startState?.doc.length,
          userEvents: trs
            .map((tr) => tr.annotation(Transaction.userEvent) ?? "-")
            .join(","),
          changes: describeChanges(trs),
          effects: trs.reduce((n, tr) => n + tr.effects.length, 0),
        })
      );
    }
  };

  private noteInput(kind: string) {
    this.recentInput.push({ kind, time: Date.now() });
    if (this.recentInput.length > recentInputSize) {
      this.recentInput.shift();
    }
  }

  private context(
    view: EditorView,
    extra: Record<string, unknown>
  ): Record<string, unknown> {
    const now = Date.now();
    const state = view.state;
    const selection = state.selection.main;
    // docView is internal to CodeMirror. Its tile length versus the
    // document length is the most direct evidence of an out-of-step view,
    // so read it defensively.
    const internal = view as unknown as {
      docView?: { tile?: { length?: number } };
    };
    return {
      docLength: state.doc.length,
      docLines: state.doc.lines,
      tileLength: internal.docView?.tile?.length,
      viewportFrom: view.viewport.from,
      viewportTo: view.viewport.to,
      selectionAnchor: selection.anchor,
      selectionHead: selection.head,
      composing: view.composing,
      compositionStarted: view.compositionStarted,
      recentInput: this.recentInput
        .map((r) => `${r.kind}-${now - r.time}ms`)
        .join(" "),
      ...extra,
    };
  }
}

/**
 * Positions and lengths only; document text must not be reported.
 */
const describeChanges = (trs: readonly Transaction[]): string => {
  const parts: string[] = [];
  for (const tr of trs) {
    tr.changes.iterChanges((fromA, toA, _fromB, _toB, inserted) => {
      if (parts.length < 10) {
        parts.push(`${fromA}-${toA}+${inserted.length}`);
      }
    });
  }
  return parts.join(" ");
};
