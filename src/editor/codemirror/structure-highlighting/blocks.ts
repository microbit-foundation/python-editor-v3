/**
 * Extraction of the code blocks that structure highlighting draws from
 * CodeMirror's syntax tree.
 *
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { syntaxTree } from "@codemirror/language";
import { EditorState } from "@codemirror/state";

// Grammar is defined by https://github.com/lezer-parser/python/blob/master/src/python.grammar
export const grammarInfo = {
  compoundStatements: new Set([
    "IfStatement",
    "WhileStatement",
    "ForStatement",
    "TryStatement",
    "WithStatement",
    "FunctionDefinition",
    "ClassDefinition",
  ]),
};

/**
 * A run of header nodes (e.g. "elif", a test expression) and the body
 * that follows them. Positions are character offsets into the document.
 * The body includes the colon and its end extends to the start of
 * whatever follows the statement.
 */
export interface CodeBlock {
  statement: string;
  /**
   * Start of the first header node of the run.
   */
  start: number;
  bodyStart: number;
  bodyEnd: number;
  /**
   * Indent depth of the header (1 per enclosing Body, starting at 0).
   */
  depth: number;
}

/**
 * Extracts a block for each header/Body run of a compound statement.
 *
 * Blocks are returned in syntax tree leave order, i.e. innermost first,
 * which the view relies on to attribute the cursor to the innermost
 * enclosing block.
 */
export const codeBlocks = (state: EditorState): CodeBlock[] => {
  const blocks: CodeBlock[] = [];
  // We could throw away blocks if we tracked returning to the top-level or started from
  // the closest top-level node. Otherwise we need to render them because they overlap.
  // Should consider switching to tree cursors to avoid allocating syntax nodes.
  let depth = 0;
  const tree = syntaxTree(state);
  const parents: {
    name: string;
    children?: { name: string; start: number; end: number }[];
  }[] = [];
  if (tree) {
    tree.iterate({
      enter: (node) => {
        parents.push({ name: node.type.name });
        if (node.type.name === "Body") {
          depth++;
        }
      },
      leave: (node) => {
        if (node.type.name === "Body") {
          depth--;
        }

        const leaving = parents.pop()!;
        const children = leaving.children;
        if (children) {
          // A block for each run of non-Body (e.g. keywords, test expressions) followed by Body in the child list.
          let runStart = 0;
          for (let i = 0; i < children.length; ++i) {
            if (children[i].name === "Body") {
              blocks.push({
                statement: leaving.name,
                start: children[runStart].start,
                bodyStart: children[i].start,
                bodyEnd: children[i].end,
                depth,
              });
              runStart = i + 1;
            }
          }
        }

        // Poke our information into our parent if we need to track it.
        const parent = parents[parents.length - 1];
        if (parent && grammarInfo.compoundStatements.has(parent.name)) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push({
            name: node.type.name,
            start: node.from,
            end: node.to,
          });
        }
      },
    });
  }
  return blocks;
};
