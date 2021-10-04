import { syntaxTree } from "@codemirror/language";
import { EditorState, StateEffect, StateField } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  WidgetType,
} from "@codemirror/view";
import { SyntaxNode } from "@lezer/common";

export const pythonWithImportsMediaType = "application/x.python-with-imports";
// We augment input.drop so we can trigger signature help.
export const inputDropApiDocs = "input.drop.apidocs";

export interface RequiredImport {
  module: string;
  name?: string;
}

export interface CodeWithImports {
  code: string;
  requiredImport: RequiredImport;
}

// The intent is to use this to draw drop cues.
interface DragState {
  pos: number | null;
  decorations: DecorationSet;
}

type DragStateChange = {
  pos: number | null;
};

export const dragStateChangeEffect = StateEffect.define<DragStateChange>({});

class InsertPointWidget extends WidgetType {
  eq(other: InsertPointWidget) {
    return true;
  }

  toDOM() {
    let lineHeight = 15;
    const elt = document.createElement("div");
    elt.style.display = "inline-block";
    elt.style.position = "relative";
    elt.style.width = "0";
    elt.style.height = lineHeight + "px";

    const cursor = document.createElement("div");
    cursor.style.display = "block";
    cursor.style.position = "absolute";
    cursor.style.left = "0";
    cursor.style.top = "0";
    cursor.style.height = lineHeight + "px";
    cursor.style.width = "1px";
    cursor.style.backgroundColor = "black";

    elt.appendChild(cursor);
    return elt;
  }
}

const dragStateField = StateField.define<DragState>({
  create() {
    return {
      pos: null,
      decorations: Decoration.none,
    };
  },
  update({ decorations, pos }, tr) {
    decorations = decorations.map(tr.changes);

    for (let e of tr.effects)
      if (e.is(dragStateChangeEffect)) {
        decorations = decorations.update({
          add:
            e.value.pos !== null
              ? [
                  Decoration.widget({
                    widget: new InsertPointWidget(),
                  }).range(e.value.pos, e.value.pos),
                ]
              : undefined,
          filter: () => false,
        });
      }
    return { decorations, pos };
  },
  provide: (f) => EditorView.decorations.from(f, (f) => f.decorations),
});

export const dragAndDrop = () => {
  const updateState = (event: DragEvent, view: EditorView) => {
    const pos = view.posAtCoords(event);
    const curr = view.state.field(dragStateField).pos;
    if (pos !== curr) {
      view.dispatch({
        effects: [
          dragStateChangeEffect.of({
            pos,
          }),
        ],
      });
    }
  };
  return [
    EditorView.domEventHandlers({
      dragover: updateState,
      dragenter: updateState,
      dragleave(event, view) {
        const rect = view.contentDOM.getBoundingClientRect();
        if (
          event.clientY < rect.top ||
          event.clientY >= rect.bottom ||
          event.clientX < rect.left ||
          event.clientX >= rect.right
        ) {
          view.dispatch({
            effects: [
              dragStateChangeEffect.of({
                pos: null,
              }),
            ],
          });
        }
      },
      drop(event, view) {
        event.preventDefault();
        const pos = view.posAtCoords(event);

        if (pos !== null) {
          const jsonText = event.dataTransfer?.getData(
            pythonWithImportsMediaType
          );
          if (jsonText) {
            const { code, requiredImport } = JSON.parse(
              jsonText
            ) as CodeWithImports;
            const importChanges = calculateImportChanges(
              view.state,
              requiredImport
            );
            const isCallable = code.endsWith(")");
            view.dispatch({
              userEvent: inputDropApiDocs,
              effects: [
                dragStateChangeEffect.of({
                  pos: null,
                }),
              ],
              changes: [...importChanges, { from: pos, to: pos, insert: code }],
              selection: {
                // Put the cursor between the brackets of functions.
                // Perhaps we shouldn't do this if the (required?) arity is zero.
                anchor:
                  pos +
                  importChanges
                    .map((c) => c.insert.length)
                    .reduce((acc, cur) => acc + cur, 0) +
                  code.length -
                  (isCallable ? 1 : 0),
              },
            });
            view.focus();
          }
        }
      },
    }),
    dragStateField,
  ];
};

type SimpleChangeSpec = {
  from: number;
  to?: number;
  insert: string;
};

export const calculateImportChanges = (
  state: EditorState,
  required: RequiredImport
): SimpleChangeSpec[] => {
  const allCurrent = currentImports(state);
  const changes = calculateImportChangesInternal(allCurrent, required);
  if (changes.length > 0 && allCurrent.length === 0) {
    // Two blank lines.
    changes[changes.length - 1].insert += "\n\n";
  }
  return changes;
};

const calculateImportChangesInternal = (
  allCurrent: Import[],
  required: RequiredImport
): SimpleChangeSpec[] => {
  const from = allCurrent.length
    ? allCurrent[allCurrent.length - 1].node.to
    : 0;
  const to = from;
  const prefix = to > 0 ? "\n" : "";

  if (!required.name) {
    // Module import.
    if (
      allCurrent.find(
        (c) => !c.names && c.module === required.module && !c.alias
      )
    ) {
      return [];
    } else {
      return [{ from, to, insert: `${prefix}import ${required.module}` }];
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
        { from, to, insert: `${prefix}from ${required.module} import *` },
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
          from,
          to,
          insert: `${prefix}from ${required.module} import ${required.name}`,
        },
      ];
    }
  }
};

interface Import {
  kind: "import" | "from";
  module: string;
  alias?: string;
  names?: ImportedName[];
  node: SyntaxNode;
}

interface ImportedName {
  name: string;
  alias?: string;
}

const currentImports = (state: EditorState): Import[] => {
  const tree = syntaxTree(state);
  const imports: (Import | undefined)[] = tree.topNode
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
        const module = state.doc.sliceString(moduleNode.from, moduleNode.to);
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
              current.alias = state.sliceDoc(node.from, node.to);
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
              name: state.sliceDoc(node.from, node.to),
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
          module: state.doc.sliceString(
            variableNames[0].from,
            variableNames[0].to
          ),
          alias:
            variableNames.length === 2
              ? state.doc.sliceString(
                  variableNames[1].from,
                  variableNames[1].to
                )
              : undefined,
          kind: "import",
          node: existingImport,
        };
      }
      return undefined;
    });
  return imports.filter((x: Import | undefined): x is Import => !!x);
};
