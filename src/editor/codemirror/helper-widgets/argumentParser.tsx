import { EditorState } from "@codemirror/state";
import { SyntaxNode } from "@lezer/common";
// TODO: might move parsing to here once arguments are no longer literals
// see index.d.ts

// Pre: args are all of type number
export function numberArgs(state: EditorState, args: any[], node:SyntaxNode): number[] {
    let nums = []
    args.forEach(function (value) {

    });
    return []
}