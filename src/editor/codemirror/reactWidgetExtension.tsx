import { HStack, Text } from "@chakra-ui/react";
import { syntaxTree } from "@codemirror/language";
import { EditorState, Extension, StateField } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  WidgetType,
} from "@codemirror/view";
import React from "react";
import { PortalFactory } from "./CodeMirror";
import "./reactWidgetExtension.css"
import { SyntaxNode } from '@lezer/common';

export interface SyntaxAtCursor {
  nodeStack: SyntaxNode[],
  currentLine: SyntaxNode,
  innermostNode: SyntaxNode
}

/**
 * An example react component that we use inside a CodeMirror widget as
 * a proof of concept.
 */
interface MethodCallProps {
  module?: string,
  method: string,
  args: string[]
}

const MethodCallComponent: React.FC<MethodCallProps> = ({
  method, module, args
}) => {
  return (
    <HStack fontFamily="body" spacing={5} py={3}>
      <Text>Calling method {method} from module {module || "GLOBAL"} with args: [{args.join(", ")}]</Text>
    </HStack>
  );
};

function node2str(node: SyntaxNode, state: EditorState) {
  return state.sliceDoc(node.from, node.to)
}

function line2widget(line: SyntaxNode, createPortal: PortalFactory, state: EditorState) {
  // console.debug(line)
  if (line.type.name !== "ExpressionStatement") return null;

  if (line.firstChild?.type.name !== "CallExpression") return null;

  let moduleName, method
  if (line.firstChild.firstChild?.type.name === "MemberExpression") {
    moduleName = node2str(line.firstChild.firstChild?.firstChild!, state)
    method = node2str(line.firstChild.firstChild?.lastChild!, state)
  } else {
    moduleName = undefined
    method = node2str(line.firstChild.firstChild!, state)
  }

  const argList = line.firstChild.lastChild
  let arg = argList?.firstChild
  let args = []
  const excluded = ["(", ")", ","]
  // The first element is always the open parenthesis, so it's skipped
  arg = arg?.nextSibling
  while (arg) {
    if (excluded.includes(arg.type.name)) continue
    args.push(node2str(arg, state))
    arg = arg?.nextSibling
  }

  console.log(module, method, args.length)

  return new ExampleReactBlockWidget(createPortal, 
  <MethodCallComponent module={moduleName} method={method} args={args}/>)
}

/**
 * This widget will have its contents rendered by the code in CodeMirror.tsx
 * which it communicates with via the portal factory.
 */
class ExampleReactBlockWidget extends WidgetType {
  private portalCleanup: (() => void) | undefined;

  constructor(private createPortal: PortalFactory, private element: JSX.Element) {
    super();
  }

  toDOM() {
    const dom = document.createElement("div");
    this.portalCleanup = this.createPortal(dom, this.element);
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

//giving me errors if I don't put some default value
export const SyntaxAtCursorContext = React.createContext<SyntaxAtCursor | null>(null);


export function SyntaxAtCursorProvider({ children }: {children: any}) {
  const [syntax] = React.useState<SyntaxAtCursor | null>(null);


  return (
    <SyntaxAtCursorContext.Provider value={syntax}>
      {children}
    </SyntaxAtCursorContext.Provider>
  );
};



/**
 * A toy extension that creates a wiget after the first line.
 */
export const reactWidgetExtension = (
  createPortal: PortalFactory
): Extension => {
  const getSyntaxAtCursor = (state: EditorState, cursor: number) => {
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

    let currentLine = nodeStack[nodeStack.length - 1];
    // We ignore the outmost node as that is always going to be the global script node
    for (let i = nodeStack.length - 1, line = state.doc.lineAt(cursor); i > 0; i--) {
      if (nodeStack[i].from < line.from && nodeStack[i].to > line.to) {
        break
      }
      currentLine = nodeStack[i]
    }
    console.log(nodeStack)
    // console.log("finished iterating", nodeStack[nodeStack.length - 1].type.name)
    return {
      currentLine,
      nodeStack,
      innermostNode: nodeStack[nodeStack.length - 1]
    }
  }

  const decorate = (state: EditorState) => {
    // Just put a widget at the start of the document.
    // A more interesting example would look at the cursor (selection) and/or syntax tree.
    const selRange = state.selection.asSingle().ranges[0]
    if (!selRange.empty) {
      return Decoration.set([])
    }
    
    // const currentLine = state.doc.lineAt(selRange.to)
    const syntaxAtCursor = getSyntaxAtCursor(state, selRange.to);

    // const endOfFirstLine = state.doc.lineAt(0).to;

    // const lineHighlight = Decoration.mark({
    //   attributes: {
    //     style: "background: red;"
    //   },
    //   class: "current-line"
    // })

    const nodeHighlight = Decoration.mark({
      attributes: {
        style: "background: green;"
      },
      class: "current-line"
    })

    const ranges = [
      // lineHighlight.range(currentLine.from, currentLine.to),
      nodeHighlight.range(syntaxAtCursor.innermostNode.from, syntaxAtCursor.innermostNode.to)
    ]

    const lineWidget = line2widget(syntaxAtCursor.currentLine, createPortal, state);
    if (lineWidget) {
      ranges.push(Decoration.widget({
        block: true,
        widget: lineWidget,
        side: 1,
      }).range(syntaxAtCursor.currentLine.to))
    }

    return Decoration.set(ranges);
  };

  const stateField = StateField.define<DecorationSet>({
    create(state) {
      return decorate(state);
    },
    update(widgets, transaction) {
      // if (transaction.docChanged) {
        return decorate(transaction.state);
      // }
      // return widgets.map(transaction.changes);
    },
    provide(field) {
      return EditorView.decorations.from(field);
    },
  });
  return [stateField];
};
