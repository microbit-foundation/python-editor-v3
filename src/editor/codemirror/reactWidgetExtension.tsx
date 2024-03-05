import { EditorState, Extension, StateField } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  WidgetType,
} from "@codemirror/view";
import { PortalFactory } from "./CodeMirror";
import { MicrobitComponent } from "./microbitWidget";


/**
 * This widget will have its contents rendered by the code in CodeMirror.tsx
 * which it communicates with via the portal factory.
 */
class ExampleReactBlockWidget extends WidgetType {
  private portalCleanup: (() => void) | undefined;

  constructor(private createPortal: PortalFactory) {
    super();
  }

  toDOM() {
    const dom = document.createElement("div");
    this.portalCleanup = this.createPortal(dom, <MicrobitComponent />);
    return dom;
  }

  destroy(dom: HTMLElement): void {
    if (this.portalCleanup) {
      this.portalCleanup();
    }
  }

  ignoreEvent() {
    return true;
  }
}

/**
 * A toy extension that creates a wiget after the first line.
 */
export const reactWidgetExtension = (
  createPortal: PortalFactory
): Extension => {
  const decorate = (state: EditorState) => {
    // Just put a widget at the start of the document.
    // A more interesting example would look at the cursor (selection) and/or syntax tree.
    const endOfFirstLine = state.doc.lineAt(0).to;
    const widget = Decoration.widget({
      block: true,
      widget: new ExampleReactBlockWidget(createPortal),
      side: 1,
    });
    
    return Decoration.set(widget.range(endOfFirstLine));
  };

  const stateField = StateField.define<DecorationSet>({
    create(state) {
      return decorate(state);
    },
    update(widgets, transaction) {
      if (transaction.docChanged) {
        return decorate(transaction.state);
      }
      return widgets.map(transaction.changes);
    },
    provide(field) {
      return EditorView.decorations.from(field);
    },
  });
  return [stateField];
};

