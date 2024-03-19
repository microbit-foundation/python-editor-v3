import { EditorState, Extension, StateField } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  WidgetType,
} from "@codemirror/view";
import { syntaxTree } from "@codemirror/language"
import { PortalFactory } from "./CodeMirror";
import {MicrobitMultiplePixelComponent} from "./microbitWidget";
//MicrobitMultiplePixelComponent

/**
 * This widget will have its contents rendered by the code in CodeMirror.tsx
 * which it communicates with via the portal factory.
 */
class ToggleWidget extends WidgetType {
  private portalCleanup: (() => void) | undefined;

  constructor(private from: number, private to: number, private createPortal: PortalFactory) {
    super();
  }

  toDOM(view: EditorView) {
    const dom = document.createElement("div");

    this.portalCleanup = this.createPortal(dom, <MicrobitMultiplePixelComponent from={this.from} to={this.to} view={view} />);
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

function createWidget(from: number, to: number, createPortal: PortalFactory): Decoration {
  let deco = Decoration.widget({
    widget: new ToggleWidget(from, to, createPortal),
    //ToggleWidget(from, to, createPortal),
    side: 1,
  });

  return deco;
}


interface WidgetProps{
  from : number,
  to : number,
  view : EditorView,
  arguments : any
}

// Iterates through the syntax tree, finding occurences of SoundEffect ArgList, and places toy widget there
export const reactWidgetExtension = (
  createPortal: PortalFactory
): Extension => {
  const decorate = (state: EditorState) => {
    let widgets: any[] = []
    let from = 0
    let to = state.doc.length-1 // TODO: could optimize this to just be lines within view
    //let t = state.doc.toString()
    //console.log(t);
    let setpix = false;

    syntaxTree(state).iterate({
      from, to,
      enter: (node: any) => { // TODO: type is SyntaxNode?
        //console.log();
        //if(node.name === "Boolean") widgets.push(createWidget(node.from, node.to, createPortal).range(node.to));

        // Found ArgList, will begin to parse nodes 
        if(setpix && node.name === "ArgList") widgets.push(createWidget(node.from, node.to, createPortal).range(node.to));
          
        // detected SoundEffect, if next expression is an ArgList, show UI
        setpix = node.name === "PropertyName" && state.doc.sliceString(node.from, node.to) === "set_pixel"
      }
    })

    return Decoration.set(widgets)
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
}
