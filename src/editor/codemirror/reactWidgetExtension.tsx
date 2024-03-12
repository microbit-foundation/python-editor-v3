import { Button, HStack, Text } from "@chakra-ui/react";
import { EditorState, Extension, StateField } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  WidgetType,
} from "@codemirror/view";
import { syntaxTree } from "@codemirror/language"
import { useState, useCallback } from "react";
import { PortalFactory } from "./CodeMirror";

/**
 * An example react component that we use inside a CodeMirror widget as
 * a proof of concept.
 */

const ToggleReactComponent = ({ bval }: { bval: boolean }) => {
  let x = bval ? "True" : "False"
  const handleClick = useCallback(() => {
    console.log();
  }, []);
  return (
    <HStack fontFamily="body" spacing={5} py={3}>
      <Button onClick={handleClick}>Toggle</Button>
      <Text fontWeight="semibold">Value: {x}</Text>
    </HStack>
  );
};

/**
 * This widget will have its contents rendered by the code in CodeMirror.tsx
 * which it communicates with via the portal factory.
 */
class ToggleWidget extends WidgetType {
  private portalCleanup: (() => void) | undefined;

  constructor(private bval: boolean, private createPortal: PortalFactory) {
    super();
  }

  toDOM() {
    const dom = document.createElement("div");

    this.portalCleanup = this.createPortal(dom, < ToggleReactComponent bval={this.bval} />);
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


const TextComponent = () => {
  return (
    <HStack fontFamily="body" spacing={5} py={3}>
      <Text fontWeight="semibold">False</Text>
    </HStack>
  );
};

class TextWidget extends WidgetType {
  private portalCleanup: (() => void) | undefined;

  constructor(private createPortal: PortalFactory) {
    super();
  }

  toDOM() {
    const dom = document.createElement("div");

    this.portalCleanup = this.createPortal(dom, < TextComponent />);
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

function createWidget(bool: string, from: number, to: number, createPortal: PortalFactory): Decoration {
  let bval = bool === "True"

  let deco = Decoration.widget({
    widget: new ToggleWidget(bval, createPortal),
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

    syntaxTree(state).iterate({
      from, to,
      enter: (node: any) => { // TODO: type is SyntaxNode
        if(node.name === "Boolean") {
          // view.dispatch({
          //   changes: {
          //     from: node.from,
          //     to: node.to,
          //     insert: state.doc.sliceString(0, 10),
          //   }
          // });
          // widgets.push(tr);

          // let replaceDeco = Decoration.replace({
          //   widget: new TextWidget(createPortal),
          //   inclusive: false,
          // }).range(node.from, node.to);
          // widgets.push(replaceDeco);

          widgets.push(createWidget(state.doc.sliceString(node.from, node.to), node.from, node.to, createPortal).range(node.to));
        }
      }
    })

    return Decoration.set(widgets)
    
    // const endOfFirstLine = state.doc.lineAt(0).to;
    // const widget = Decoration.widget({
    //   block: true,
    //   widget: new ExampleReactBlockWidget(createPortal),
    //   side: 1,
    // });
    // return Decoration.set(widget.range(endOfFirstLine));
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