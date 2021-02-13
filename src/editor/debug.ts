/**
 * A CoreMirror view extension that dumps the syntax tree to the
 * console. For debug use only.
 */
import { syntaxTree } from "@codemirror/language";
import { NodeType } from "lezer-tree";
import { EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";

function isInteresting(type: NodeType) {
  // Just to limit the output to something readable. Bug still evident with full tree.
  return type.name === "ClassDefinition" || type.name === "FunctionDefinition";
}

export const debug = () =>
  ViewPlugin.fromClass(
    class {
      constructor(readonly view: EditorView) {}
      update(_update: ViewUpdate) {
        this.view.requestMeasure({
          read: () => {
            let tree = syntaxTree(this.view.state);
            let depth = 0;
            console.log("Syntax tree dump:");
            tree.iterate({
              from: 0,
              to: tree.length,
              enter: (type, start) => {
                if (isInteresting(type)) {
                  depth++;
                  let indent = "  ".repeat(depth);
                  console.log(`${indent} ${type.name} ${start}`);
                }
              },
              leave: (type, _start, _end) => {
                if (isInteresting(type)) {
                  depth--;
                }
              },
            });
          },
          write: () => {},
        });
      }
      destroy() {}
    }
  );
