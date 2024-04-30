import { EditorState } from "@codemirror/state";
import { SyntaxNode } from "@lezer/common";
import { WidgetProps } from "./reactWidgetExtension";
import { MicrobitSinglePixelComponent } from "./setPixelWidget";
import { MicrobitMultiplePixelComponent } from "./showImageWidget";
import { SoundComponent } from "./soundWidget";
import { OpenReactComponent, OpenSoundComponent } from "./openWidgets";

export interface CompProps {
  comp: React.ComponentType<any>;
  props: WidgetProps;
  open: React.ComponentType<any>
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
    case "audio.SoundEffect":
    case "SoundEffect":
      component = SoundComponent;
      break;
    default:
      // No widget implemented for this function
      // console.log("No widget implemented for this function: " + name);
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
      open: OpenButtonDesign(component, args, types)
    };
  }
  return null;
}

// Gets all child nodes of a CallExpression, no typechecking
function getChildNodes(node: SyntaxNode): SyntaxNode[] {
  let child = node.firstChild?.nextSibling;
  let children = [];
  while (child && child.name !== ")") {
    if (child.name !== "," && child.name !== "Comment") children.push(child);
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

function OpenButtonDesign(
  name: React.ComponentType<any>,
  args: string[],
  types: string[]
): React.ComponentType<any> {
  switch (name) {
    case MicrobitMultiplePixelComponent:
      return OpenReactComponent;
    case MicrobitSinglePixelComponent:
      return OpenReactComponent;
    case SoundComponent:
      return OpenSoundComponent;
    default:
      // shouldnt be called so just null
      return OpenReactComponent;
  }
}

export function ValidateComponentArgs(
  name: React.ComponentType<any>,
  args: string[],
  types: string[]
): boolean {
  switch (name) {
    case MicrobitMultiplePixelComponent:
      return true;
    case MicrobitSinglePixelComponent:
      // If more than 3 arguments, don't open
      if (args.length > 3) {
        return false;
      }
      // If some arguments are not numbers or empty, don't open
      for (let i = 0; i < args.length; i++) {
        if (types[i] !== "Number" && args[i] !== ",") {
          return false;
        }
      }
      return true;
    case SoundComponent:
      return true;
    default:
      return false;
  }
}
