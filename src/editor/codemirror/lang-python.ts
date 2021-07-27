// Couldn't persude codesandbox to use a GH branch as a dep so inlined from
// https://github.com/microbit-matt-hillsdon/lang-python/blob/indent-rethink/src/python.ts
import { parser } from "lezer-python";
import {
  delimitedIndent,
  indentNodeProp,
  foldNodeProp,
  foldInside,
  LezerLanguage,
  LanguageSupport,
  TreeIndentContext,
} from "@codemirror/language";
import { styleTags, tags as t } from "@codemirror/highlight";
import { SyntaxNode } from "lezer-tree";

function shouldDedentAfter(node: SyntaxNode, pos: number): boolean {
  switch (node.type.name) {
    case "BreakStatement":
    case "ContinueStatement":
    case "PassStatement":
      return true;
    // For return and raise we need to check we're not in the expression.
    case "RaiseStatement":
    case "ReturnStatement":
      return pos >= node.to;
    default:
      return false;
  }
}

function bodyIndent(context: TreeIndentContext) {
  // Indentation is significant in Python so modify it with care.
  let currentIndent = context.lineIndent(context.state.doc.lineAt(context.pos));
  let childBefore = context.node.childBefore(context.pos);
  if (childBefore && shouldDedentAfter(childBefore, context.pos))
    return context.baseIndent;

  let nodeBefore = context.node.resolve(context.pos, -1);
  let isBodyStart = nodeBefore && nodeBefore.name === ":";
  if (isBodyStart) return context.baseIndent + context.unit;
  return currentIndent;
}

/// A language provider based on the [Lezer Python
/// parser](https://github.com/lezer-parser/python), extended with
/// highlighting and indentation information.
export const pythonLanguage = LezerLanguage.define({
  parser: parser.configure({
    props: [
      indentNodeProp.add({
        Body: bodyIndent,
        ArgList: delimitedIndent({ closing: ")" }),
        ArrayExpression: delimitedIndent({ closing: "]" }),
        DictionaryExpression: delimitedIndent({ closing: "}" }),
        ParamList: delimitedIndent({ closing: ")" }),
        ParenthesizedExpression: delimitedIndent({ closing: ")" }),
        TupleExpression: delimitedIndent({ closing: ")" }),
        Script: (context) => {
          let currentIndent = context.lineIndent(
            context.state.doc.lineAt(context.pos)
          );
          if (
            context.pos + /\s*/.exec(context.textAfter)![0].length <
            context.node.to
          ) {
            return currentIndent;
          }
          // Position at the end of the document isn't inside a trailing body so adjust.
          let lastNode = context.node.resolve(context.pos, -1);
          for (let cur: SyntaxNode | null = lastNode; cur; cur = cur.parent)
            if (cur.type.name == "Body")
              return bodyIndent(
                // @ts-ignore
                new TreeIndentContext(context, context.pos, cur)
              );
          return currentIndent;
        },
      }),
      foldNodeProp.add({
        "Body ArrayExpression DictionaryExpression TupleExpression": foldInside,
      }),
      styleTags({
        "async '*' '**' FormatConversion": t.modifier,
        "for while if elif else try except finally return raise break continue with pass assert await yield":
          t.controlKeyword,
        "in not and or is del": t.operatorKeyword,
        "import from def class global nonlocal lambda": t.definitionKeyword,
        "with as print": t.keyword,
        self: t.self,
        Boolean: t.bool,
        None: t.null,
        VariableName: t.variableName,
        "CallExpression/VariableName": t.function(t.variableName),
        "FunctionDefinition/VariableName": t.function(
          t.definition(t.variableName)
        ),
        "ClassDefinition/VariableName": t.definition(t.className),
        PropertyName: t.propertyName,
        "CallExpression/MemberExpression/PropertyName": t.function(
          t.propertyName
        ),
        Comment: t.lineComment,
        Number: t.number,
        String: t.string,
        FormatString: t.special(t.string),
        UpdateOp: t.updateOperator,
        ArithOp: t.arithmeticOperator,
        BitOp: t.bitwiseOperator,
        CompareOp: t.compareOperator,
        AssignOp: t.definitionOperator,
        Ellipsis: t.punctuation,
        At: t.meta,
        "( )": t.paren,
        "[ ]": t.squareBracket,
        "{ }": t.brace,
        ".": t.derefOperator,
        ", ;": t.separator,
      }),
    ],
  }),
  languageData: {
    closeBrackets: { brackets: ["(", "[", "{", "'", '"', "'''", '"""'] },
    commentTokens: { line: "#" },
    indentOnInput: /^\s*[\}\]\)]$/,
  },
});

/// Python language support.
export function python() {
  return new LanguageSupport(pythonLanguage);
}
