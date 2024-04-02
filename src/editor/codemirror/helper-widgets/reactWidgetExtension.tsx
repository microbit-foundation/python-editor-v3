import { Button, HStack, Text } from "@chakra-ui/react";
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
import { useCallback } from "react";
import { MicrobitSinglePixelComponent } from "./setPixelWidget";
import { MicrobitMultiplePixelComponent } from "./showImageWidget"
import { createWidget } from "./widgetArgParser";

export interface WidgetProps {
  // Note: always an array, can be singleton
  args: any[]
  // Ranges of where to insert each argument
  ranges: {from:number, to:number} []
  // Whether or not each argument is a literal
  literals: boolean[]
  // Where to insert the changed values
  from: number,
  to: number
}

// Location of currently open widget, -1 if all closed
export let openWidgetLoc = -1;
const OpenReactComponent = ({ loc, view }: { loc: number, view: EditorView }) => {
  const handleClick = useCallback(() => {
    openWidgetLoc = loc;
    // TODO: not sure how to force a view update without a list of changes
    view.dispatch({
      changes: {
        from: 0,
        to: 1,
        insert: view.state.doc.sliceString(0, 1),
      }
    });
  }, []);
  return (
    <HStack fontFamily="body" spacing={5} py={3}>
      <Button onClick={handleClick}>Open</Button>
    </HStack>
  );
};

/**
 * This widget will have its contents rendered by the code in CodeMirror.tsx
 * which it communicates with via the portal factory.
 */
class Widget extends WidgetType {
  private portalCleanup: (() => void) | undefined;

  constructor(private component: React.ComponentType<any>,
    private props:WidgetProps, private inline:boolean,
    private createPortal: PortalFactory) {
    super();
  }

  toDOM(view: EditorView) {
    const dom = document.createElement("div");

    if(this.inline) {
      dom.style.display = 'inline-block'; // want it inline for the open-close widget
      this.portalCleanup = this.createPortal(dom, <OpenReactComponent loc={this.props.to} view={view} />);
    }
    else this.portalCleanup = this.createPortal(dom, React.createElement(this.component, this.props, view));
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

    syntaxTree(state).iterate({
      enter: (ref) => {
        // Found an ArgList, parent will be a CallExpression
        if (ref.name === "ArgList" && ref.node.parent) {          
          // Match CallExpression name to our widgets
          let name = state.doc.sliceString(ref.node.parent.from, ref.from)
          let widget = createWidget(name, state, ref.node);
          if(widget) {
            if(widget.props.to != openWidgetLoc){
              let deco = Decoration.widget({
                widget: new Widget(widget.comp, widget.props, true, createPortal),
                side: 1,
              });
              widgets.push(deco.range(ref.to));
            }
            else{
              let deco = Decoration.widget({
                widget: new Widget(widget.comp, widget.props, false, createPortal),
                side: 1,
              });
              widgets.push(deco.range(ref.to));
            }
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
        transaction.changes.iterChangedRanges((_fromA, _toA, _fromB, _toB) => {
          if(_toA <= openWidgetLoc){
            openWidgetLoc += (_toB - _fromB) - (_toA - _fromA)
          }
        });
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
