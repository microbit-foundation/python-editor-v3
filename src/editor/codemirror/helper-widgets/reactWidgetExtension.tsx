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
import { MicrobitSinglePixelComponent } from "./setPixelWidget";
import { MicrobitMultiplePixelComponent } from "./showImageWidget"
//import { numberArgs } from "./argumentParser";

export interface WidgetProps<T> {
  // Note: always an array, can be singleton
  args: T[]
  // Where to insert the changed values
  from: number,
  to: number,
  // Widget will change textfile
  view: EditorView
}

/**
 * This widget will have its contents rendered by the code in CodeMirror.tsx
 * which it communicates with via the portal factory.
 */
class Widget<T> extends WidgetType {
  private portalCleanup: (() => void) | undefined;

  constructor(private component: React.ComponentType<any>,
    private args: T[], private from: number, private to: number,
    private createPortal: PortalFactory,) {
    super();
  }

  toDOM(view: EditorView) {
    const dom = document.createElement("div");
    let props = {
      args: this.args,
      from: this.from,
      to: this.to,
      view: view
    }

    this.portalCleanup = this.createPortal(dom, React.createElement(this.component, props));
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

// Iterates through the syntax tree, finding occurences of SoundEffect ArgList, and places toy widget there
export const reactWidgetExtension = (
  createPortal: PortalFactory
): Extension => {
  const decorate = (state: EditorState) => {
    let widgets: any[] = []
    // Creates a widget which accepts arguments of type T
    function createWidget<T>(comp: React.ComponentType<any>, args: T[], from: number, to: number) {
      args.forEach(function (value) { console.log(value); })

      let deco = Decoration.widget({
        widget: new Widget<T>(comp, args, to, from, createPortal),
        side: 1,
      });

      widgets.push(deco.range(to));
    }

    syntaxTree(state).iterate({
      enter: (ref) => {
        // Found an ArgList, parent will be a CallExpression
        if (ref.name === "ArgList" && ref.node.parent) {
          //console.log(state.doc.sliceString(ref.node.parent.from, ref.from));

          // Match CallExpression name to our widgets
          switch (state.doc.sliceString(ref.node.parent.from, ref.from)) {
            case "display.set_pixel":
              // TODO: assuming all literals for now, will probably want a way to detect other types of arguments
              let args: number[] = [];
              ref.node.getChildren("Number").forEach(function (child) { args.push(+state.doc.sliceString(child.from, child.to)) });

              createWidget<number>(MicrobitSinglePixelComponent, args, ref.from, ref.to);
              break;
            case "Image":
              // TODO: does not handle comments properly
              let imArg: string[] = []
              let arg = ref.node.getChild("ContinuedString");
              if (arg) imArg.push(state.doc.sliceString(arg.from, arg.to).replaceAll(/[' \n]/g, ""));
              else {
                arg = ref.node.getChild("String");
                if (arg) imArg.push()
              }

              createWidget<string>(MicrobitMultiplePixelComponent, imArg, ref.from, ref.to);
              break;
            default:
              // No widget implemented for this function
              break;
          }
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
