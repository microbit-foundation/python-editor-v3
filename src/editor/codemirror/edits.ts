/**
 * Code-aware edits to CodeMirror Python text.
 *
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { python } from "@codemirror/lang-python";
import { ensureSyntaxTree } from "@codemirror/language";
import { EditorState, Text } from "@codemirror/state";
import { SyntaxNode, Tree } from "@lezer/common";
import { CodeInsertType } from "./dnd";
import { indentBy, removeCommonIndent } from "./indent";

export interface RequiredImport {
  module: string;
  name?: string;
}

type SimpleChangeSpec = {
  from: number;
  to?: number;
  insert: string;
};

/**
 * A representation of an import node.
 * The CodeMirror tree isn't easy to work with so we convert to these.
 */
interface ImportNode {
  kind: "import" | "from";
  module: string;
  alias?: string;
  names?: ImportedName[];
  node: SyntaxNode;
}

/**
 * An imported name with alias.
 */
interface ImportedName {
  name: string;
  alias?: string;
}

// CM has more options than this.
class AliasesNotSupportedError extends Error {}

/**
 * Calculate the changes needed to insert the given code into the editor.
 * Imports are separated and merged with existing imports.
 * The remaining code (if any) is inserted prior to any non-import code.
 *
 * @param state The editor state.
 * @param addition The new Python code.
 * @param type The type of change.
 * @param line Optional 1-based target line. This can be a greater than the number of lines in the document.
 * @param indentLevelHint 0 based indent level hint (e.g. 2 for column 8 = 2 * 4 spaces). This is used to allow the indent to be less than the previous non-blank line where this is likely to result in correctly indented code.
 * @returns A CM transaction with the necessary changes.
 * @throws AliasesNotSupportedError If the additional code contains alias imports.
 */
export const calculateChanges = (
  state: EditorState,
  source: string,
  type: CodeInsertType,
  line?: number,
  indentLevelHint?: number,
  paste?: boolean
) => {
  const parser = python().language.parser;
  const sourceTree = parser.parse(source);
  const sourceImports = topLevelImports(sourceTree, (from, to) =>
    source.slice(from, to)
  );
  const sourceImportsTo =
    sourceImports[sourceImports.length - 1]?.node?.to ?? 0;
  let mainCode = source.slice(sourceImportsTo).trim();
  const requiredImports = sourceImports.flatMap(
    convertImportNodeToRequiredImports
  );
  const allCurrentImports = currentImports(state);

  const importInsertPoint = defaultInsertPoint(state, allCurrentImports);
  const importChanges = requiredImports.flatMap((required) =>
    calculateImportChangesInternal(
      importInsertPoint,
      allCurrentImports,
      required
    )
  );
  if (importChanges.length > 0 && allCurrentImports.length === 0) {
    // Two blank lines separating the imports from everything else.
    importChanges[importChanges.length - 1].insert += "\n\n";
  }
  const importLines = importChanges
    .map((c) => c.insert.split("\n").length - 1)
    .reduce((acc, cur) => acc + cur, 0);

  let mainPreceedingWhitespace = "";
  let mainChange: SimpleChangeSpec | undefined;
  let mainIndent = "";
  if (mainCode) {
    let mainFrom: number;
    if (line !== undefined) {
      if (paste) {
        mainFrom = state.doc.line(line).from;
      } else {
        // Tweak so the addition preview is under the mouse even if we added imports.
        line = Math.max(1, line - importLines);
        const extraLines = line - state.doc.lines;
        if (extraLines > 0) {
          mainFrom = state.doc.length;
          mainPreceedingWhitespace = "\n".repeat(extraLines);
        } else {
          mainFrom = state.doc.line(line).from;
        }
      }
    } else {
      // When no line is specified, insert before the code (not just after the imports).
      mainFrom = skipWhitespaceLines(state.doc, importInsertPoint.from);
    }

    const whileTrueLine = "while True:\n";
    if (
      mainCode.startsWith(whileTrueLine) &&
      isInWhileTrueTree(state, mainFrom)
    ) {
      mainCode = removeCommonIndent(mainCode.slice(whileTrueLine.length));
    }
    mainIndent = "    ".repeat(
      findIndentLevel(state, mainFrom, indentLevelHint)
    );
    mainChange = {
      from: mainFrom,
      insert: mainPreceedingWhitespace + indentBy(mainCode, mainIndent) + "\n",
    };
  }

  if (importInsertPoint.used) {
    const firstChange = importChanges[0] ?? mainChange;
    firstChange.insert = importInsertPoint.prefix + firstChange.insert;
  }
  const selection = calculateNewSelection(
    mainCode,
    type,
    importChanges,
    mainChange,
    mainPreceedingWhitespace,
    mainIndent
  );
  return state.update({
    userEvent: `dnd.drop.${type}`,
    changes: [...importChanges, ...(mainChange ? [mainChange] : [])],
    scrollIntoView: true,
    selection,
  });
};

const findIndentLevel = (
  state: EditorState,
  mainFrom: number,
  levelHint: number | undefined
): number => {
  // This affects whether we can lower the indent level based on the hint.
  let nextNonBlankLineIndentLevel: number = 0;
  for (const line of succeedingLinesInclusive(state, mainFrom)) {
    const text = line.text;
    if (text.trim()) {
      nextNonBlankLineIndentLevel = indentLevel(text);
      break;
    }
  }
  // Now base our indent level on the preceeding non-blank line, using the hint
  // if it will reduce indentation and we're not mid block.
  for (const line of preceedingLinesExclusive(state, mainFrom)) {
    const text = line.text;
    if (text.trim()) {
      let indent = indentLevel(text);
      // Beginning of block:
      if (text.trim().endsWith(":")) {
        indent += 1;
      } else if (
        levelHint !== undefined &&
        levelHint < indent &&
        nextNonBlankLineIndentLevel < indent &&
        indentLevelOfContainingWhileTrue(state, mainFrom) + 1 !== indent
      ) {
        if (levelHint < nextNonBlankLineIndentLevel) {
          return nextNonBlankLineIndentLevel;
        }
        return levelHint;
      }
      return indent;
    }
  }
  return 0;
};

const indentLevel = (text: string): number => {
  return Math.floor((text.match(/^(\s*)/)?.[0] ?? "").length / 4);
};

const preceedingLinesExclusive = function* (state: EditorState, from: number) {
  const initialLine = state.doc.lineAt(from);
  // Special case: if there was no line break on the previous line then
  // we're inserting one. So we need to use the current line as the preceding
  // line.
  let initial =
    initialLine.to === from ? initialLine.number : initialLine.number - 1;
  for (let line = initial; line >= 1; --line) {
    yield state.doc.line(line);
  }
};

const succeedingLinesInclusive = function* (state: EditorState, from: number) {
  const initial = state.doc.lineAt(from).number;
  for (let line = initial; line <= state.doc.lines; ++line) {
    yield state.doc.line(line);
  }
};

const calculateNewSelection = (
  mainCode: string,
  type: CodeInsertType,
  importChanges: SimpleChangeSpec[],
  mainChange: SimpleChangeSpec | undefined,
  mainBlankLines: string,
  mainIndent: string
): { anchor: number } | undefined => {
  if (!mainChange) {
    return undefined;
  }
  const importLength = importChanges.flatMap((c) => c.insert).join("").length;
  const mainLength = mainChange.insert.length;
  const from = mainChange.from;
  if (type === "call") {
    // E.g. `foo(█)\n`
    // with potential imports
    const callableAdjustment = 2;
    return {
      anchor: from + importLength + mainLength - callableAdjustment,
    };
  }

  // E.g.
  // ```
  // import foo
  //
  // # preexisting
  // █foo()
  // foo()
  // ```

  // If multiline then we move to the start of the new code, otherwise the end of the line.
  if (mainCode.includes("\n")) {
    return {
      anchor: from + importLength + mainBlankLines.length + mainIndent.length,
    };
  }
  const newlineAdjustment = 1;
  return {
    anchor: from + importLength + mainLength - newlineAdjustment,
  };
};

/**
 * Find the beginning of the first content line after `pos`,
 * or failing that return `pos` unchanged.
 */
const skipWhitespaceLines = (
  doc: Text,
  pos: number,
  dir: 1 | -1 = 1
): number => {
  let original = doc.lineAt(pos);
  let line = original;
  while (!line.text.trim()) {
    try {
      line = doc.line(line.number + dir);
    } catch {
      break;
    }
  }
  return line.number === original.number
    ? pos
    : dir === 1
    ? line.from
    : line.to;
};

const calculateImportChangesInternal = (
  importInsertPoint: DefaultImportInsertPoint,
  allCurrent: ImportNode[],
  required: RequiredImport
): SimpleChangeSpec[] => {
  if (!required.name) {
    // Module import.
    if (
      allCurrent.find(
        (c) => !c.names && c.module === required.module && !c.alias
      )
    ) {
      return [];
    } else {
      return [
        { from: importInsertPoint.from, insert: `import ${required.module}\n` },
      ];
    }
  } else if (required.name === "*") {
    // Wildcard import.
    if (
      allCurrent.find(
        (c) =>
          c.names?.length === 1 &&
          c.names[0].name === "*" &&
          c.module === required.module
      )
    ) {
      return [];
    } else {
      return [
        {
          from: importInsertPoint.from,
          insert: `from ${required.module} import *\n`,
        },
      ];
    }
  } else {
    // Importing some name from a module.
    const partMatches = allCurrent.filter(
      (c) =>
        c.names &&
        !(c.names?.length === 1 && c.names[0].name === "*") &&
        c.module === required.module
    );
    const fullMatch = partMatches.find((nameImport) =>
      nameImport.names?.find((n) => n.name === required.name && !n.alias)
    );
    if (fullMatch) {
      return [];
    } else if (partMatches.length > 0) {
      return [
        {
          from: partMatches[0].node.to,
          to: partMatches[0].node.to,
          insert: `, ${required.name}`,
        },
      ];
    } else {
      return [
        {
          from: importInsertPoint.from,
          insert: `from ${required.module} import ${required.name}\n`,
        },
      ];
    }
  }
};

/**
 * The default point to insert imports.
 *
 * This tracks whether its used and exposes a prefix to add to the first import
 * if it's used.
 *
 * This helps address the case where the document is a single line containing
 * an import, as in that scenario there is no trailing line break.
 */
class DefaultImportInsertPoint {
  used: boolean = false;
  private _from;

  constructor(from: number, public prefix: string = "") {
    this._from = from;
  }

  get from() {
    this.used = true;
    return this._from;
  }
}

const defaultInsertPoint = (
  state: EditorState,
  allCurrent: ImportNode[]
): DefaultImportInsertPoint => {
  if (allCurrent.length > 0) {
    const line = state.doc.lineAt(allCurrent[allCurrent.length - 1].node.to);
    // We want the point after the line break, i.e. the start of the next line.
    if (state.doc.lines > line.number) {
      return new DefaultImportInsertPoint(state.doc.line(line.number + 1).from);
    }
    // If it doesn't exist, we want the end of this line, but need to insert a
    // line break later if we actually insert anything.
    return new DefaultImportInsertPoint(line.to, "\n");
  }
  return new DefaultImportInsertPoint(0);
};

const currentImports = (state: EditorState): ImportNode[] => {
  const tree = ensureSyntaxTree(state, state.doc.length);
  if (!tree) {
    return [];
  }
  return topLevelImports(tree, (from, to) => state.sliceDoc(from, to));
};

const isInWhileTrueTree = (state: EditorState, pos: number): boolean => {
  return indentLevelOfContainingWhileTrue(state, pos) !== -1;
};

const indentLevelOfContainingWhileTrue = (
  state: EditorState,
  pos: number
): number => {
  pos = skipWhitespaceLines(state.doc, pos, -1);
  const tree = ensureSyntaxTree(state, state.doc.length);
  if (!tree) {
    return -1;
  }
  let done = false;
  for (const cursor = tree.cursorAt(pos, 0); !done; done = !cursor.parent()) {
    if (cursor.type.name === "WhileStatement") {
      const maybeTrueNode = cursor.node.firstChild?.nextSibling;
      if (
        maybeTrueNode?.type.name === "Boolean" &&
        state.sliceDoc(maybeTrueNode.from, maybeTrueNode.to) === "True"
      ) {
        return indentLevel(state.doc.lineAt(cursor.from).text);
      }
    }
  }
  return -1;
};

const topLevelImports = (
  tree: Tree,
  text: (from: number, to: number) => string
): ImportNode[] => {
  const imports: (ImportNode | undefined)[] = tree.topNode
    .getChildren("ImportStatement")
    .map((existingImport) => {
      // The tree is flat here, so making sense of this is distressingly like parsing it again.
      // (1) kw<"from"> (("." | "...")+ dottedName? | dottedName) kw<"import"> ("*" | importList | importedNames)
      // (2) kw<"import"> dottedName (kw<"as"> VariableName)? |
      if (existingImport.firstChild?.name === "from") {
        const moduleNode = existingImport.getChild("VariableName");
        if (!moduleNode) {
          return undefined;
        }
        const module = text(moduleNode.from, moduleNode.to);
        const importNode = existingImport.getChild("import");
        if (!importNode) {
          return undefined;
        }
        const names: ImportedName[] = [];
        let current: ImportedName | undefined;
        for (
          let node = importNode.nextSibling;
          node;
          node = node?.nextSibling
        ) {
          const isVariableName = node.name === "VariableName";
          if (current) {
            if (isVariableName) {
              current.alias = text(node.from, node.to);
            } else if (
              node.name === "as" ||
              node.name === "(" ||
              node.name === ")"
            ) {
              continue;
            } else if (node.name === ",") {
              names.push(current);
              current = undefined;
            }
          } else {
            current = {
              name: text(node.from, node.to),
            };
          }
        }
        if (current) {
          names.push(current);
        }
        return { module, names, kind: "from", node: existingImport };
      } else if (existingImport.firstChild?.name === "import") {
        const variableNames = existingImport.getChildren("VariableName");
        if (variableNames.length === 0) {
          return undefined;
        }
        return {
          module: text(variableNames[0].from, variableNames[0].to),
          alias:
            variableNames.length === 2
              ? text(variableNames[1].from, variableNames[1].to)
              : undefined,
          kind: "import",
          node: existingImport,
        };
      }
      return undefined;
    });
  return imports.filter((x: ImportNode | undefined): x is ImportNode => !!x);
};

/**
 * Flattens an import node into the imported names.
 * Throws if aliases are encountered.
 */
const convertImportNodeToRequiredImports = (
  actualImport: ImportNode
): RequiredImport[] => {
  if (actualImport.kind === "from") {
    return (actualImport.names ?? []).map((name) => {
      if (name.alias) {
        throw new AliasesNotSupportedError();
      }
      return {
        module: actualImport.module,
        name: name.name,
      };
    });
  }
  if (actualImport.alias) {
    throw new AliasesNotSupportedError();
  }
  return [
    {
      module: actualImport.module,
    },
  ];
};
