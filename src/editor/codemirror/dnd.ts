import { syntaxTree } from "@codemirror/language";
import { EditorState, StateEffect } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { SyntaxNode } from "@lezer/common";

export const pythonWithImportsMediaType = "application/x.python-with-imports";

interface RequiredImport {
  module: string;
  name?: string;
}

export interface CodeWithImports {
  code: string;
  requiredImport: RequiredImport;
}

// The intent is to use this to draw drop cues.
interface DragState {
  active: boolean;
  pos: number | null;
}

type DragStateChange = Partial<DragState>;

export const dragStateChangeEffect = StateEffect.define<DragStateChange>({});

export const dragAndDrop = () =>
  EditorView.domEventHandlers({
    dragover(event, view) {
      const pos = view.posAtCoords(event);
      view.dispatch({
        effects: [
          dragStateChangeEffect.of({
            pos,
          }),
        ],
      });
    },
    dragenter(event, view) {
      view.dispatch({
        effects: [
          dragStateChangeEffect.of({
            active: true,
          }),
        ],
      });
    },
    dragleave(event, view) {
      view.dispatch({
        effects: [
          dragStateChangeEffect.of({
            active: false,
          }),
        ],
      });
    },
    drop(event, view) {
      event.preventDefault();
      const pos = view.posAtCoords(event);

      if (pos !== null) {
        const jsonText = event.dataTransfer?.getData(
          pythonWithImportsMediaType
        );
        if (jsonText) {
          const { code, requiredImport } = JSON.parse(jsonText) as CodeWithImports;
          const importChanges = calculateImportChanges(view.state, requiredImport);
          const isCallable = code.endsWith(")");
          view.dispatch({
            effects: [
              dragStateChangeEffect.of({
                active: false,
              }),
            ],
            userEvent: "input.drop.apidocs",
            changes: [...importChanges, { from: pos, to: pos, insert: code }],
            selection: {
              // Put the cursor between the brackets of functions.
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
  });

type SimpleChangeSpec = {
  from: number;
  to?: number;
  insert: string;
};

function calculateImportChanges(
  state: EditorState,
  required: RequiredImport
): SimpleChangeSpec[] {
  const allCurrent = currentImports(state);
  if (!required.name) {
    // Module import.
    if (allCurrent.find(c => !c.names && c.module === required.module)) {
      return [];
    } else {
      return [{ from: 0, to: 0, insert: `import ${required.module}\n`}];
    }
  } else if (required.name === "*") {
    // Wildcard import.
    if (allCurrent.find(c => c.names?.length === 1 && c.names[0].name === "*" && c.module === required.module)) {
      return [];
    } else {
      return [{ from: 0, to: 0, insert: `from ${required.module} import *\n`}];
    }
  } else {
    // Importing some name from a module.
    const partMatches = allCurrent.filter(c => c.names && !(c.names?.length === 1 && c.names[0].name === "*") && c.module === required.module);
    const fullMatch = partMatches.find(nameImport => nameImport.names?.find(n => n.name === required.name && !n.alias))
    if (fullMatch) {
      return [];
    } else if (partMatches.length > 0) {
      return [
        {
          from: partMatches[0].node.to,
          to: partMatches[0].node.to,
          insert: `, ${required.name}`
        }
      ]
    } else {
      return [{ from: 0, to: 0, insert: `from ${required.module} import ${required.name}\n`}];
    }
  }
}

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
          module: state.doc.sliceString(variableNames[0].from, variableNames[0].to),
          alias: variableNames.length === 2
            ? state.doc.sliceString(variableNames[1].from, variableNames[1].to)
            : undefined,
          kind: "import",
          node: existingImport
        };
      }
      return undefined;
    });
    return imports.filter((x: Import | undefined): x is Import => !!x);
};
