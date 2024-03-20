import { EditorState, Extension, StateField } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  WidgetType,
} from "@codemirror/view";
import { syntaxTree } from "@codemirror/language"
import { PortalFactory } from "../CodeMirror";
import React from "react";
import {MicrobitMultiplePixelComponent, MicrobitSinglePixelComponent} from "./microbitWidget";
import { numberArgs } from "./argumentParser";

interface WidgetProps<T>{
  from : number,
  to : number,
  arguments : T[]
}

/**
 * This widget will have its contents rendered by the code in CodeMirror.tsx
 * which it communicates with via the portal factory.
 */
class Widget<T> extends WidgetType {
  private portalCleanup: (() => void) | undefined;

  constructor(private component : React.ComponentType<any>, private props: WidgetProps<T>, private createPortal: PortalFactory, ) {
    super();
  }

  toDOM(view: EditorView) {
    const dom = document.createElement("div");
    this.portalCleanup = this.createPortal(dom, React.createElement(this.component, { props: this.props, view: view }));
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

function createWidget<T>(comp: React.ComponentType<any>, from: number, to: number, args: T[], createPortal: PortalFactory): Decoration {
  let props = {
    from : from,
    to : to,
    arguments : args
  }
  let deco = Decoration.widget({
    widget: new Widget(comp, props, createPortal),
    side: 1,
  });

  return deco;
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
    let image = false;
    syntaxTree(state).iterate({
      from, to,
      enter: (ref) => {
        //console.log(ref.name);

        // Found ArgList, will begin to parse nodes 
        if(setpix && ref.name === "ArgList") {
          let cs = ref.node.getChildren("Number");
          if(cs.length === 3) {
            widgets.push(createWidget<number>(
              MicrobitSinglePixelComponent, 
              ref.from, ref.to, 
              numberArgs(state, cs),
              createPortal).range(ref.to));
            }
          }
        if(image && ref.name === "ArgList"){
          let s = ref.node.getChild("ContinuedString");
          
        }

        // detected set_pixel, if next expression is an ArgList, show UI
        setpix = ref.name === "PropertyName" && state.doc.sliceString(ref.from, ref.to) === "set_pixel"
        if(setpix){
          console.log(ref.node.nextSibling);
        }
        image = ref.name === "VariableName" && state.doc.sliceString(ref.from, ref.to) === "Image"
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
