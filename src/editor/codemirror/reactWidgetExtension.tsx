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
import React from "react";
//MicrobitMultiplePixelComponent

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

    syntaxTree(state).iterate({
      from, to,
      enter: (node: any) => { // TODO: type is SyntaxNode?
        //console.log();
        //if(node.name === "Boolean") widgets.push(createWidget(node.from, node.to, createPortal).range(node.to));

        // Found ArgList, will begin to parse nodes 
        if(setpix && node.name === "ArgList") {
          widgets.push(createWidget<number>(
            MicrobitMultiplePixelComponent, 
            node.from, node.to, 
            [1, 2, 3],
            createPortal).range(node.to));
        }
        // detected SoundEffect, if next expression is an ArgList, show UI
        setpix = node.name === "PropertyName" && state.doc.sliceString(node.from, node.to) === "set_pixel"
        if(setpix) {
          
        }
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
