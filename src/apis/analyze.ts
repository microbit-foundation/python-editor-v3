import { Tree, TreeCursor, SyntaxNode } from "lezer-tree";
import { parser } from "lezer-python";

/**
 * References:
 *
 * https://github.com/lezer-parser/python/blob/master/src/python.grammar
 * https://lezer.codemirror.net/docs/ref/#tree.SyntaxNode
 *
 * Next steps:
 *
 * - Teach it some type checking so that names can be reported with types.
 *
 *   My priority is to be able to understand microbit API stubs, so e.g.
 *   `display = new _Display()` works via `from microbit import *`.
 *   The stubs will use type annotations (e.g. for the methods on display).
 *
 *   https://docs.python.org/3/reference/datamodel.html#types
 *   https://mypy.readthedocs.io/en/stable/builtin_types.html
 *   https://docs.python.org/3/library/typing.html
 *   https://www.python.org/dev/peps/pep-0484/
 *   https://www.python.org/dev/peps/pep-0483/
 */

export type PythonPath = (path: string) => string;
const VARIABLE_NAME = "VariableName";
const isNewScope = (name: string): boolean => {
  switch (name) {
    case "ClassDefinition":
    case "FunctionDefinition":
    case "DictionaryComprehensionExpression":
    case "ComprehensionExpression":
    case "ArrayComprehensionExpression":
      return true;
    default:
      return false;
  }
};

interface HasLocation {
  from: number;
  to: number;
}

class AnalysisBuilder {
  private names: Set<string> = new Set();
  private all: Set<string> | undefined;
  constructor() {}
  reportName(_location: HasLocation, name: string) {
    this.names.add(name);
  }
  reportAll(names: Set<string>) {
    this.all = names;
  }
  reportError(_location: HasLocation, message: string) {
    // Nothing yet.
  }
  toAnalysis(): InterfaceAnalysis {
    // At some point we'll store type info about the name.
    const wildcardNames = this.all
      ? new Set(Array.from(this.names).filter((x) => this.all!.has(x)))
      : this.names;
    return {
      wildcardNames,
      names: this.names,
    };
  }
}

export interface InterfaceAnalysis {
  names: Set<string>;
  wildcardNames: Set<string>;
}

class Module {
  constructor(
    private tree: Tree,
    private text: string,
    private environment: PythonEnvironment
  ) {}
  textAt(location: HasLocation | null): string | undefined {
    if (!location) {
      return undefined;
    }
    const { from, to } = location;
    return this.text.slice(from, to);
  }
  names(): InterfaceAnalysis {
    const cursor = this.tree.fullCursor();
    // Skip down to children of the Script.
    cursor.firstChild();
    if (!cursor.name) {
      // TODO: What's going on with this node?
      cursor.firstChild();
    }

    const builder = new AnalysisBuilder();
    do {
      // Process imports, function and class definitions and statements
      // in the order they appear, potentially overwriting names as we
      // go. Recurse into non-definitional statements other than
      // generators/comprehensions as their names are also in scope.
      switch (cursor.name) {
        case "ImportStatement": {
          this.processImportStatement(cursor, builder);
          break;
        }
        case "FunctionDefinition": {
          this.processFunctionDefinition(cursor, builder);
          break;
        }
        case "ClassDefinition": {
          this.processClassDefinition(cursor, builder);
          break;
        }
        default: {
          const all = this.tryAsAllStatement(cursor);
          if (all) {
            builder.reportAll(all);
          } else {
            this.processStatementTree(cursor, builder);
          }
          break;
        }
      }
    } while (cursor.nextSibling());

    return builder.toAnalysis();
  }

  processStatementTree(cursor: TreeCursor, builder: AnalysisBuilder) {
    // Recurse into it, taking every AssignOp that doesn't require us to go into a new scope.
    // This is naive. We'll need a more careful approach to get type information.
    if (cursor.name === "AssignStatement") {
      // TODO: Consider lvalues that aren't simple variable names, in particular attribute access.
      for (const nameNode of cursor.node.getChildren(
        "VariableName",
        undefined,
        "AssignOp"
      )) {
        builder.reportName(cursor, this.textAt(nameNode)!);
      }
    }
    if (isNewScope(cursor.name)) {
      return;
    }
    if (cursor.firstChild()) {
      do {
        this.processStatementTree(cursor, builder);
      } while (cursor.nextSibling());
      cursor.parent();
    }
  }

  processFunctionDefinition(cursor: TreeCursor, builder: AnalysisBuilder) {
    const name = this.textAt(
      cursor.node.getChild(VARIABLE_NAME, "def", "ParamList")
    );
    if (name) {
      builder.reportName(cursor, name);
    }
  }

  processAssignOp(cursor: TreeCursor, builder: AnalysisBuilder) {
    cursor.node.getChild(VARIABLE_NAME, null);
    const name = this.textAt(
      cursor.node.getChild(VARIABLE_NAME, "class", "ArgList")
    );
    if (name) {
      builder.reportName(cursor, name);
    }
  }

  processClassDefinition(cursor: TreeCursor, builder: AnalysisBuilder) {
    const name = this.textAt(
      cursor.node.getChild(VARIABLE_NAME, "class", "ArgList")
    );
    if (name) {
      builder.reportName(cursor, name);
    }
  }

  processImportStatement(cursor: TreeCursor, builder: AnalysisBuilder) {
    // TODO: add support for relative imports.
    const node = cursor.node;
    if (node.getChild("from")) {
      const moduleDottedName = node
        .getChildren(VARIABLE_NAME, "from", "import")
        .map((n) => this.textAt(n))
        .join(".");

      const module = this.environment.loadModule(moduleDottedName);
      const moduleAnalysis = module.names();

      const wildcard = node.getChild("*", "import");
      if (wildcard) {
        for (const name of Array.from(moduleAnalysis.wildcardNames)) {
          builder.reportName(wildcard, name);
        }
      } else {
        const names = node.getChildren(VARIABLE_NAME, "import");
        for (const nameNode of names) {
          const name = this.textAt(nameNode)!;
          if (moduleAnalysis.names.has(name)) {
            builder.reportName(nameNode, name);
          } else {
            builder.reportError(
              nameNode,
              `Could not find ${name} imported from ${moduleDottedName}`
            );
          }
        }
      }
    } else {
      const module = node
        .getChildren(
          VARIABLE_NAME,
          "import",
          node.getChild("as") ? "as" : undefined
        )
        .map((n) => this.textAt(n))
        .join(".");
      const as = this.textAt(node.getChild(VARIABLE_NAME, "as"));
      if (as || module) {
        builder.reportName(node, as || module);
      }
    }
  }

  tryAsAllStatement(cursor: TreeCursor): Set<string> | undefined {
    if (cursor.name === "AssignStatement") {
      const name = this.textAt(
        cursor.node.getChild("VariableName", undefined, "AssignOp")
      );
      if (name === "__all__") {
        const array = cursor.node.getChild("ArrayExpression", "AssignOp");
        if (array) {
          const strings = array.getChildren("String");
          return new Set(strings.map((s) => this.evaluateStringLiteral(s)));
        }
      }
    }
    return undefined;
  }

  evaluateStringLiteral(s: SyntaxNode): string {
    const text = this.textAt(s)!;
    // TODO: This includes formatting stuff prefixes etc.
    return text.slice(1, text.length - 1);
  }
}

export class PythonEnvironment {
  private modules = new Map<string, Module>();

  constructor(private pythonPath: PythonPath) {}

  loadModule(name: string): Module {
    let module = this.modules.get(name);
    if (!module) {
      const text = this.pythonPath(name);
      const tree = parser.parse(text);
      module = new Module(tree, text, this);
      this.modules.set(name, module);
    }
    return module;
  }
}
