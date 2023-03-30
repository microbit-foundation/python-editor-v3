import { Button, HStack, Input, Text } from "@chakra-ui/react";
import { syntaxTree } from "@codemirror/language";
import { EditorState, Extension, StateField } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  WidgetType,
} from "@codemirror/view";
import { useCallback } from "react";
import { supportedLanguages, useSettings } from "../../settings/settings";
import { PortalFactory } from "./CodeMirror";
import "./reactWidgetExtension.css"
import { SyntaxNode } from '@lezer/common';

/**
 * An example react component that we use inside a CodeMirror widget as
 * a proof of concept.
 */
const ExampleReactComponent = () => {
  // This is a weird thing to do in a CodeMirror widget but proves the point that
  // we can use React features to communicate with the rest of the app.
  const [settings, setSettings] = useSettings();
  const handleClick = useCallback(() => {
    let { languageId } = settings;
    while (languageId === settings.languageId) {
      languageId =
        supportedLanguages[
          Math.floor(Math.random() * supportedLanguages.length)
        ].id;
    }
    setSettings({
      ...settings,
      languageId,
    });
  }, [settings, setSettings]);
  return (
    <HStack fontFamily="body" spacing={5} py={3}>
      <Input></Input>
    </HStack>
  );
};

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
    this.portalCleanup = this.createPortal(dom, <ExampleReactComponent />);
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
  const getNodeStack = (state: EditorState, cursor: number) => {
    let nodeStack: SyntaxNode[] = [];
    syntaxTree(state).iterate({
      from: cursor,
      to: cursor,
      enter(node) {
        // console.log(node.type.name, node.from, node.to)
        nodeStack.push(node.node)
      }
      // leave(node) {
      //   if (enabled) {
      //     innermost = node
      //   }
      // }
    })
    // console.log("finished iterating", nodeStack[nodeStack.length - 1].type.name)
    return nodeStack
  }

  const decorate = (state: EditorState) => {
    // Just put a widget at the start of the document.
    // A more interesting example would look at the cursor (selection) and/or syntax tree.
    const selRange = state.selection.asSingle().ranges[0]
    if (!selRange.empty) {
      return Decoration.set([])
    }
    const currentLine = state.doc.lineAt(selRange.to)
    
    const nodeStack = getNodeStack(state, selRange.to);
    const innermost = nodeStack[nodeStack.length - 2];

    // const endOfFirstLine = state.doc.lineAt(0).to;
    const widget = Decoration.widget({
      block: true,
      widget: new ExampleReactBlockWidget(createPortal),
      side: 1,
    });
    const highlight = Decoration.mark({
      // attributes: {
      //   style: "background: red;"
      // },
      class: "current-line"
    })
    return Decoration.set([highlight.range(innermost.from, innermost.to), widget.range(currentLine.to)]);
  };

  const stateField = StateField.define<DecorationSet>({
    create(state) {
      return decorate(state);
    },
    update(widgets, transaction) {
      // if (transaction.docChanged) {
        return decorate(transaction.state);
      // }
      return widgets.map(transaction.changes);
    },
    provide(field) {
      return EditorView.decorations.from(field);
    },
  });
  return [stateField];
};
