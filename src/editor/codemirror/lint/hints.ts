/**
 * Similar to lint except it handles hint level LSP diagnostics
 * that aren't indended to have the same UI has other diagnostics.
 *
 * In pratice we only see unreachable code from Pyright.
 */
import { StateEffect, StateField } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView } from "@codemirror/view";
import { hoverTooltip } from "@codemirror/tooltip";
import elt from "crelt";

/**
 * Analogous to a diagnostic but used to represent the hint level
 * LSP diagnostics that require custom presentation.
 */
export interface Hint {
  /**
   * The start position of the relevant text.
   */
  from: number;

  /**
   * The end position. May be equal to `from`, though actually
   * covering text is preferable.
   */
  to: number;

  /**
   * The message associated with this diagnostic.
   */
  message: string;

  /**
   * Hint tag. Non-tagged hints from LSP are discarded.
   */
  tags: HintTag[];
}

export type HintTag = "unnecessary" | "deprecated";

export class HintState {
  constructor(readonly hints: DecorationSet) {}

  static init(hints: readonly Hint[]) {
    let ranges = Decoration.set(
      hints.map((h: Hint) => {
        return Decoration.mark({
          attributes: {
            class: [
              "cm-hintRange",
              ...h.tags.map((t) => `cm-hintRange-${t}`),
            ].join(" "),
          },
          hint: h,
        }).range(h.from, h.to);
      }),
      true
    );
    return new HintState(ranges);
  }
}

export const setHintsEffect = StateEffect.define<readonly Hint[]>();

export const hintState = StateField.define<HintState>({
  create() {
    return new HintState(Decoration.none);
  },
  update(value, tr) {
    if (tr.docChanged) {
      value = new HintState(value.hints.map(tr.changes));
    }
    for (let effect of tr.effects) {
      if (effect.is(setHintsEffect)) {
        value = HintState.init(effect.value);
      }
    }
    return value;
  },
  provide: (f) => [EditorView.decorations.from(f, (s) => s.hints)],
});

function hintTooltip(view: EditorView, pos: number, side: -1 | 1) {
  let { hints } = view.state.field(hintState);
  let found: Hint[] = [],
    stackStart = 2e8,
    stackEnd = 0;
  hints.between(
    pos - (side < 0 ? 1 : 0),
    pos + (side > 0 ? 1 : 0),
    (from, to, { spec }) => {
      if (
        pos >= from &&
        pos <= to &&
        (from === to || ((pos > from || side > 0) && (pos < to || side < 0)))
      ) {
        found.push(spec.hint);
        stackStart = Math.min(from, stackStart);
        stackEnd = Math.max(to, stackEnd);
      }
    }
  );
  if (!found.length) return null;

  return {
    pos: stackStart,
    end: stackEnd,
    above: view.state.doc.lineAt(stackStart).to < stackEnd,
    create() {
      return { dom: hintsTooltip(found) };
    },
  };
}

function hintsTooltip(hints: readonly Hint[]) {
  return elt(
    "ul",
    { class: "cm-tooltip-hint" },
    hints.map((h) => renderHint(h))
  );
}

function renderHint(hint: Hint) {
  return elt(
    "li",
    { class: ["cm-hint", ...hint.tags.map((t) => `cm-hint-${t}`)].join(" ") },
    elt("span", { class: "cm-hintText" }, hint.message)
  );
}

const baseTheme = EditorView.baseTheme({
  ".cm-hint": {
    padding: "3px 6px 3px 8px",
    marginLeft: "-1px",
    display: "block",
    whiteSpace: "pre-wrap",
  },
  // As per info diagnostics.
  ".cm-hint-unnecessary": { borderLeft: "5px solid #999" },
  ".cm-hint-deprecated": { borderLeft: "5px solid #999" },

  ".cm-hintRange": {
    backgroundPosition: "left bottom",
    backgroundRepeat: "repeat-x",
    paddingBottom: "0.7px",
  },

  ".cm-hintRange-unnecessary": { opacity: 0.5 },
  ".cm-hintRange-deprecated": { textDecoration: "line-through" },

  ".cm-tooltip-hint": {
    padding: 0,
    margin: 0,
  },
});

export function hints() {
  return [hintState, hoverTooltip(hintTooltip), baseTheme];
}
