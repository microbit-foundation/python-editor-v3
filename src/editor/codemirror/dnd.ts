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
  // eslint-disable-next-line
  const tree = syntaxTree(state);
  // TODO!
  return [];
}
