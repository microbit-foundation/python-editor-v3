import {
  keymap,
  highlightSpecialChars,
  drawSelection,
  highlightActiveLine,
  KeyBinding,
} from "@codemirror/view";
import { Extension, EditorState, Prec } from "@codemirror/state";
import { history, historyKeymap } from "@codemirror/history";
import { indentOnInput, indentUnit } from "@codemirror/language";
import { lineNumbers } from "@codemirror/gutter";
import { defaultKeymap, indentLess, indentMore } from "@codemirror/commands";
import { bracketMatching } from "@codemirror/matchbrackets";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/closebrackets";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import { autocompletion, completionKeymap } from "@codemirror/autocomplete";
import { commentKeymap } from "@codemirror/comment";
import { rectangularSelection } from "@codemirror/rectangular-selection";
import { defaultHighlightStyle } from "@codemirror/highlight";
import { lintKeymap } from "@codemirror/lint";
import { EditorView } from "@codemirror/view";
import { python } from "@codemirror/lang-python";
import { completion } from "./completion";

const customTabBinding: KeyBinding = {
  key: "Tab",
  run: indentMore,
  shift: indentLess,
};

export const themeExtensionsTag = "themeExtensions";

export const themeExtensions = (fontSizePt: number) => {
  const fontSize = `${fontSizePt}pt`;
  return EditorView.theme({
    $content: {
      fontSize,
    },
    $gutter: {
      fontSize,
      backgroundColor: "var(--code-background)",
    },
    $completionIcon: {
      // Seems broken by default
      width: "auto",
      // But they're also cryptic, so hide until we can improve.
      display: "none",
    },
    $completionLabel: {
      fontSize,
    },
    $activeLine: {
      backgroundColor: "rgba(243, 249, 255, 0.5)",
    },
    // $wrap can't be styled here, see App.css.
  });
};

const indentSize = 4;
export const editorConfig: Extension = [
  // Probably a good idea? https://discuss.codemirror.net/t/ios-turn-off-autocorrect/2912
  EditorView.contentAttributes.of({ autocorrect: "off" }),
  // Mostly as per the basic-setup module.
  // Most of these features should be discussed on a case-by-case basis
  // to see if they're more magic than helpful.
  lineNumbers(),
  highlightSpecialChars(),
  history(),
  // We sort-of have this in the current version, but Giles is not a fan.
  // foldGutter(),
  drawSelection(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  Prec.fallback(defaultHighlightStyle),
  bracketMatching(),
  closeBrackets(),
  autocompletion({
    override: completion,
  }),
  rectangularSelection(),
  highlightActiveLine(),
  highlightSelectionMatches(),

  keymap.of([
    // Added, but see https://codemirror.net/6/examples/tab/ for accessibility discussion.
    customTabBinding,
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    // Disabled for now, see comment on foldGutter.
    // ...foldKeymap,
    ...commentKeymap,
    ...completionKeymap,
    ...lintKeymap,
  ]),

  // Fixed custom extensions.
  EditorState.tabSize.of(indentSize), // But hopefully not used!
  indentUnit.of(" ".repeat(indentSize)),
  python(),
];
