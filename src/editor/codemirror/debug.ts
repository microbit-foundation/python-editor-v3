/**
 * A CoreMirror view extension that dumps the syntax tree to the
 * console. For debug use only.
 *
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { syntaxTree } from "@codemirror/language";
import { NodeType } from "@lezer/common";
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
              enter: (node) => {
                if (isInteresting(node.type)) {
                  depth++;
                  let indent = "  ".repeat(depth);
                  console.log(`${indent} ${node.type.name} ${node.from}`);
                }
              },
              leave: (node) => {
                if (isInteresting(node.type)) {
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
