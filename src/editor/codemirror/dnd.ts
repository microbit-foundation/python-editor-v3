import { syntaxTree } from "@codemirror/language";
import { EditorState, StateEffect } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

export const pythonWithImportsMediaType = "application/x.python-with-imports";

interface RequiredImport {
  module: string;
  names: string[];
}

export interface CodeWithImports {
  code: string;
  imports: RequiredImport[];
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
          const { code, imports } = JSON.parse(jsonText) as CodeWithImports;
          const importChanges = calculateImportChanges(view.state, imports);
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
  imports: RequiredImport[]
): SimpleChangeSpec[] {
  const current = currentImports(state);
  console.log(current);
  return [];
}

interface Import {
  kind: "import" | "from";
  module: string;
  alias?: string;
  names?: ImportedName[];
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
        return { module, names, kind: "from" };
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
          kind: "import"
        };
      }
      return undefined;
    });
    return imports.filter((x: Import | undefined): x is Import => !!x);
};
