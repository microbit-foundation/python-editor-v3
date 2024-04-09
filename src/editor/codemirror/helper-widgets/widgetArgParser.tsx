import { EditorState } from "@codemirror/state";
import { SyntaxNode } from "@lezer/common";
import { WidgetProps } from "./reactWidgetExtension";
import { MicrobitSinglePixelComponent } from "./setPixelWidget";
import { MicrobitMultiplePixelComponent } from "./showImageWidget";

export interface CompProps {
  comp: React.ComponentType<any>;
  props: WidgetProps;
}

export function createWidget(
  name: string,
  state: EditorState,
  node: SyntaxNode
): CompProps | null {
  let children = getChildNodes(node);
  let ranges = getRanges(children);
  let args = getArgs(state, ranges);
  let types = getTypes(children);
  let component: React.ComponentType<any> | null = null;

  switch (name) {
    case "display.set_pixel":
      component = MicrobitSinglePixelComponent;
      break;
    case "Image":
      component = MicrobitMultiplePixelComponent;
      break;
    case "SoundEffect":
      // TODO: sound effect
      component = MicrobitMultiplePixelComponent;
      break;
    default:
      // No widget implemented for this function
      return null;
  }
  if (component) {
    return {
      comp: component,
      props: {
        args: args,
        ranges: ranges,
        types: types,
        from: node.from,
        to: node.to,
      },
    };
  }
  return null;
}

// Gets all child nodes of a CallExpression, no typechecking
function getChildNodes(node: SyntaxNode): SyntaxNode[] {
  let child = node.firstChild?.nextSibling;
  let children = [];
  while (child && child.name !== ")") {
    if (child.name !== ",") children.push(child);
    child = child.nextSibling;
  }
  return children;
}

// Gets ranges for insertion into arguments
function getRanges(nodes: SyntaxNode[]): { from: number; to: number }[] {
  let ranges: { from: number; to: number }[] = [];
  nodes.forEach(function (value) {
    ranges.push({ from: value.from, to: value.to });
  });
  return ranges;
}

// Gets arguments as string
function getArgs(
  state: EditorState,
  ranges: { from: number; to: number }[]
): string[] {
  let args: string[] = [];
  ranges.forEach(function (value) {
    args.push(state.doc.sliceString(value.from, value.to));
  });
  return args;
}

// Gets types of each arg to determine if it is editable
function getTypes(nodes: SyntaxNode[]): string[] {
  let types: string[] = [];
  nodes.forEach(function (value) {
    types.push(value.name);
  });
  return types;
}
