import { EditorState } from "@codemirror/state";
import {
    Decoration,
    DecorationSet,
    EditorView,
    WidgetType,
} from "@codemirror/view";
import { SyntaxNode } from "@lezer/common";
import { WidgetProps } from "./reactWidgetExtension";
import { MicrobitSinglePixelComponent } from "./setPixelWidget";
import { MicrobitMultiplePixelComponent } from "./showImageWidget";

export interface CompProps {
    comp: React.ComponentType<any>,
    props: WidgetProps
}

export function createWidget(name: string, state: EditorState, node: SyntaxNode): CompProps | null {
    switch (name) {
        case "display.set_pixel":
            return {
                comp: MicrobitSinglePixelComponent,
                props: {
                    args: [],
                    ranges: [],
                    literals: [],
                    from: 0,
                    to: 0
                }
            }
        //     // TODO: assuming all literals for now, will probably want a way to detect other types of arguments
        //   let args: number[] = [];
        //   ref.node.getChildren("Number").forEach(function (child) { args.push(+state.doc.sliceString(child.from, child.to)) });

        //   createWidget<number>(MicrobitSinglePixelComponent, args, ref.from, ref.to);
        case "Image":
            return {
                comp: MicrobitMultiplePixelComponent,
                props: {
                    args: [],
                    ranges: [],
                    literals: [],
                    from: 0,
                    to: 0
                }
            }
        
        // TODO: does not handle comments properly
        //   let imArg: string[] = []
        //   let arg = ref.node.getChild("ContinuedString");
        //   if (arg) imArg.push(state.doc.sliceString(arg.from, arg.to).replaceAll(/[' \n]/g, ""));
        //   else {
        //     arg = ref.node.getChild("String");
        //     if (arg) imArg.push()
        //   }

        //   createWidget<string>(MicrobitMultiplePixelComponent, imArg, ref.from, ref.to);
        //   break;
        default:
          // No widget implemented for this function
          return null;
    }
}

// Pre: args are all of type number
export function numberArgs(state: EditorState, args: any[], node:SyntaxNode): number[] {
    let nums = []
    args.forEach(function (value) {

    });
    return []
}