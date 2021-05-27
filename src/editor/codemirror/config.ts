import {
  keymap,
  highlightSpecialChars,
  drawSelection,
  highlightActiveLine,
  KeyBinding,
} from "@codemirror/view";
import { Extension, EditorState, Prec, Compartment } from "@codemirror/state";
import { history, historyKeymap } from "@codemirror/history";
import { indentOnInput, indentUnit } from "@codemirror/language";
import { lineNumbers } from "@codemirror/gutter";
import { defaultKeymap, indentLess, indentMore } from "@codemirror/commands";
import { bracketMatching } from "@codemirror/matchbrackets";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/closebrackets";
import { autocompletion, completionKeymap } from "@codemirror/autocomplete";
import { commentKeymap } from "@codemirror/comment";
import { defaultHighlightStyle } from "@codemirror/highlight";
import { lintKeymap } from "@codemirror/lint";
import { EditorView } from "@codemirror/view";
import { python } from "@codemirror/lang-python";
import { completion } from "./completion";
import myHighlightStyle from "./myHighlightStyle";

const customTabBinding: KeyBinding = {
  key: "Tab",
  run: indentMore,
  shift: indentLess,
};

export const themeExtensionsCompartment = new Compartment();

// CodeMirror maps grammar nodes to a set of predefined tags so that themes
// can be written in a language independent way. Tags can extend others so it
// is sufficient to address just the base tags in a theme but you can be more
// specific if you need to.
// This file defines all the tags and has useful documentation:
// https://github.com/codemirror/highlight/blob/main/src/highlight.ts#L480
// This file shows the mapping of grammar nodes to tags for Python
// https://github.com/codemirror/lang-python/blob/main/src/python.ts#L17

const indentSize = 4;
export const editorConfig: Extension = [
  EditorView.contentAttributes.of({
    // Probably a good idea? https://discuss.codemirror.net/t/ios-turn-off-autocorrect/2912
    autocorrect: "off",
    // This matches Ace/Monaco behaviour.
    autocapitalize: "none",
    // Disable Grammarly.
    "data-gramm": "false",
  }),
  lineNumbers(),
  highlightSpecialChars(),
  history(),
  drawSelection(),
  indentOnInput(),
  Prec.fallback(defaultHighlightStyle),
  bracketMatching(),
  closeBrackets(),
  myHighlightStyle(),
  autocompletion({
    override: completion,
  }),
  highlightActiveLine(),

  keymap.of([
    // Added, but see https://codemirror.net/6/examples/tab/ for accessibility discussion.
    customTabBinding,
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...historyKeymap,
    ...commentKeymap,
    ...completionKeymap,
    ...lintKeymap,
  ]),

  // Fixed custom extensions.
  EditorState.tabSize.of(indentSize), // But hopefully not used!
  indentUnit.of(" ".repeat(indentSize)),
  python(),
];
