/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { python } from "@codemirror/lang-python";
import { SyntaxNode } from "@lezer/common";

const parser = python().language.parser;

// Keep these in sync with the initialization blocks in content/de/sensoren.
const sensors = [
  {
    variable: "sensor",
    constructor: "hdc1080.HDC1080",
    block: "HDC1080 initialisieren",
    englishBlock: "Initialise HDC1080",
    slug: "hdc1080-initialisieren",
  },
  {
    variable: "dps310",
    constructor: "adafruit_dps310.basic.DPS310",
    block: "Luftdrucksensor initialisieren",
    englishBlock: "Initialise air-pressure sensor",
    slug: "luftdrucksensor-initialisieren",
  },
  {
    variable: "bme680",
    constructor: "adafruit_bme680.Adafruit_BME680_I2C",
    block: "BME680 initialisieren",
    englishBlock: "Initialise BME680",
    slug: "bme680-initialisieren",
  },
  {
    variable: "imu",
    constructor: "adafruit_icm20x.ICM20948",
    block: "Bewegungssensor initialisieren",
    englishBlock: "Initialise motion sensor",
    slug: "bewegungssensor-initialisieren",
  },
  {
    variable: "uv",
    constructor: "adafruit_veml6070.VEML6070",
    block: "UV-Sensor initialisieren",
    englishBlock: "Initialise UV sensor",
    slug: "uv-sensor-initialisieren",
  },
  {
    variable: "photodiode",
    constructor: "analogio.AnalogIn",
    block: "Photodiode initialisieren",
    englishBlock: "Initialise photodiode",
    slug: "photodiode-initialisieren",
  },
  {
    variable: "tof",
    constructor: "vl53lxcx.VL53L8CX",
    block: "ToF-Sensor initialisieren",
    englishBlock: "Initialise ToF sensor",
    slug: "vl53l8cx-initialisieren",
  },
];

const constructors = new Set([
  "board.I2C",
  "busio.I2C",
  "digitalio.DigitalInOut",
  ...sensors.map((sensor) => sensor.constructor),
]);

type Bindings = Map<string, string>;
interface Resource {
  name: string;
  key: string;
  constructor: string;
}

const isSetupStatement = (
  source: string,
  node: SyntaxNode,
  bindings: Bindings
): boolean => {
  if (["ImportStatement", "Comment", "PassStatement"].includes(node.name))
    return true;
  if (node.name === "ExpressionStatement") {
    const call = node.firstChild;
    if (call?.name !== "CallExpression") return false;
    const callee = signature(source, call.firstChild!, bindings);
    return callee === "time.sleep" || /\.(?:reset|init|deinit)$/.test(callee);
  }
  if (node.name === "AssignStatement") {
    const [, , value] = children(node);
    if (!value) return false;
    if (["Number", "String", "Boolean", "None"].includes(value.name))
      return true;
    if (value.name === "CallExpression")
      return constructors.has(signature(source, value.firstChild!, bindings));
    if (value.name === "MemberExpression")
      return /^(?:board|microcontroller|digitalio)\./.test(
        signature(source, value, bindings)
      );
  }
  return false;
};

const children = (node: SyntaxNode): SyntaxNode[] => {
  const result: SyntaxNode[] = [];
  for (let child = node.firstChild; child; child = child.nextSibling) {
    result.push(child);
  }
  return result;
};

const text = (source: string, node: SyntaxNode) =>
  source.slice(node.from, node.to);

const imports = (source: string, root: SyntaxNode): Bindings => {
  const result: Bindings = new Map();
  for (const node of root.getChildren("ImportStatement")) {
    const statement = text(source, node).replace(/\s+/g, " ").trim();
    const from = /^from ([\w.]+) import (.*)$/.exec(statement);
    const names = (from?.[2] ?? statement.slice(7))
      .replace(/[()]/g, "")
      .split(",");
    for (const name of names) {
      const match = /^\s*([\w.]+)(?: as (\w+))?\s*$/.exec(name);
      if (match) {
        result.set(
          match[2] ?? (from ? match[1] : match[1].split(".")[0]),
          from
            ? `${from[1]}.${match[1]}`
            : match[2]
            ? match[1]
            : match[1].split(".")[0]
        );
      }
    }
  }
  return result;
};

// Compare syntax tokens, preserving strings and resolving imported names / bus
// references. Whitespace, comments and variable spellings aren't bus identities.
const signature = (
  source: string,
  node: SyntaxNode,
  bindings: Bindings
): string => {
  if (node.name === "Comment") return "";
  if (node.name === "VariableName" && node.nextSibling?.name !== "AssignOp") {
    return bindings.get(text(source, node)) ?? `$${text(source, node)}`;
  }
  const nested = children(node);
  return nested.length
    ? nested.map((child) => signature(source, child, bindings)).join("")
    : text(source, node);
};

const resourceAssignment = (
  source: string,
  node: SyntaxNode,
  bindings: Bindings
): Resource | undefined => {
  const [target, operator, value, extra] = children(node);
  if (
    node.name !== "AssignStatement" ||
    target?.name !== "VariableName" ||
    operator?.name !== "AssignOp" ||
    text(source, operator) !== "=" ||
    !value ||
    extra
  )
    return;
  const name = text(source, target);
  const key = signature(source, value, bindings);
  // An unresolved / reassigned dependency is not evidence of identical setup.
  if (key.includes("$")) return;
  if (value.name === "CallExpression") {
    const constructor = signature(source, value.firstChild!, bindings);
    if (constructors.has(constructor)) return { name, key, constructor };
  } else if (
    value.name === "MemberExpression" &&
    /^microcontroller\.pin\.GPIO\d+$/.test(key)
  ) {
    return { name, key, constructor: "pin" };
  }
  return;
};

const variableNames = (root: SyntaxNode, source: string): Set<string> => {
  const names = new Set<string>();
  const cursor = root.cursor();
  do {
    if (cursor.name === "VariableName")
      names.add(source.slice(cursor.from, cursor.to));
  } while (cursor.next());
  return names;
};

const declaredNames = (root: SyntaxNode, source: string): Set<string> => {
  const names = new Set(imports(source, root).keys());
  const cursor = root.cursor();
  do {
    const node = cursor.node;
    if (
      [
        "AssignStatement",
        "UpdateStatement",
        "FunctionDefinition",
        "ClassDefinition",
      ].includes(node.name)
    ) {
      const target = node.name.endsWith("Definition")
        ? node.getChild("VariableName")
        : node.firstChild;
      if (target)
        for (const name of variableNames(target, source)) names.add(name);
    }
  } while (cursor.next());
  return names;
};

const hasError = (root: SyntaxNode): boolean => {
  const cursor = root.cursor();
  do {
    if (cursor.type.isError) return true;
  } while (cursor.next());
  return false;
};

// Don't rewrite snippets which locally rebind a setup variable. They require
// scope analysis beyond the deliberately small, documented sensor blocks.
const canRename = (root: SyntaxNode, source: string, name: string): boolean => {
  const cursor = root.cursor();
  let assignments = 0;
  do {
    if (
      cursor.name !== "VariableName" ||
      source.slice(cursor.from, cursor.to) !== name
    )
      continue;
    const node = cursor.node;
    if (
      node.parent?.name === "ParamList" ||
      node.parent?.name === "ForStatement" ||
      node.parent?.name.includes("Comprehension") ||
      node.parent?.name === "ImportStatement"
    )
      return false;
    if (
      node.parent?.name === "AssignStatement" &&
      node.nextSibling?.name === "AssignOp"
    )
      assignments++;
  } while (cursor.next());
  return assignments <= 1;
};

interface Replacement {
  from: number;
  to: number;
  insert: string;
}
const rewrite = (
  source: string,
  root: SyntaxNode,
  renames: Bindings,
  removals: SyntaxNode[]
): string => {
  const edits: Replacement[] = removals.map((node) => ({
    from: node.from,
    to: node.to,
    insert: "",
  }));
  const cursor = root.cursor();
  do {
    if (
      cursor.name !== "VariableName" ||
      removals.some((node) => cursor.from >= node.from && cursor.to <= node.to)
    )
      continue;
    const node = cursor.node;
    // Keyword argument names and property names aren't variable references.
    if (
      node.parent?.name === "ArgList" &&
      node.nextSibling?.name === "AssignOp"
    )
      continue;
    const replacement = renames.get(source.slice(cursor.from, cursor.to));
    if (replacement)
      edits.push({ from: cursor.from, to: cursor.to, insert: replacement });
  } while (cursor.next());
  for (const edit of edits.sort((a, b) => b.from - a.from)) {
    source = source.slice(0, edit.from) + edit.insert + source.slice(edit.to);
  }
  return source.trim();
};

/** Prepare an explicitly selected sensor block without changing existing code. */
export const prepareSensorSnippet = (
  document: string,
  source: string,
  sourceImports: string
) => {
  const root = parser.parse(document).topNode;
  const incoming = parser.parse(source).topNode;
  const unchanged = { setup: "", main: source, setupFrom: 0 };
  if (hasError(root) || hasError(incoming)) return unchanged;

  // Only unconditional module-level setup is reusable. Never borrow objects
  // from a function, a conditional branch or code after the main loop.
  const preamble = children(root);
  const bindings = imports(document, root);
  const stop = preamble.findIndex(
    (node) => !isSetupStatement(document, node, bindings)
  );
  const setupFrom = stop < 0 ? document.length : preamble[stop].from;
  const boundNames = declaredNames(root, document);
  const resources = new Map<string, Resource>();
  for (const node of preamble.filter((node) => node.to <= setupFrom)) {
    if (
      node.name === "AssignStatement" &&
      node.firstChild?.name === "VariableName"
    ) {
      boundNames.add(text(document, node.firstChild));
    }
    const resource = resourceAssignment(document, node, bindings);
    if (resource) {
      resources.set(resource.name, resource);
      bindings.set(resource.name, resource.key);
    } else if (
      node.name === "AssignStatement" &&
      node.firstChild?.name === "VariableName"
    ) {
      const name = text(document, node.firstChild);
      bindings.delete(name);
      resources.delete(name);
    } else if (node.name === "ExpressionStatement") {
      const deinit = /^(\w+)\.deinit\(\)$/.exec(
        text(document, node).replace(/\s/g, "")
      );
      if (deinit) {
        resources.clear();
        bindings.clear();
        for (const [name, value] of imports(document, root))
          bindings.set(name, value);
      }
    }
  }

  const sourceBindings = imports(
    sourceImports,
    parser.parse(sourceImports).topNode
  );
  const renames: Bindings = new Map();
  const removals: SyntaxNode[] = [];
  const usedNames = new Set([
    ...variableNames(root, document),
    ...variableNames(incoming, source),
  ]);
  const statements = children(incoming);
  const firstMain = statements.findIndex((node) =>
    [
      "WhileStatement",
      "ForStatement",
      "FunctionDefinition",
      "ClassDefinition",
    ].includes(node.name)
  );
  const setupEnd = firstMain < 0 ? source.length : statements[firstMain].from;
  let hasSetup = false;
  for (const node of statements.filter((node) => node.to <= setupEnd)) {
    const resource = resourceAssignment(source, node, sourceBindings);
    if (!resource) continue;
    hasSetup = true;
    if (!canRename(incoming, source, resource.name)) return unchanged;
    const existing = [...resources.values()].find(
      (candidate) => candidate.key === resource.key
    );
    const name =
      existing?.name ??
      (() => {
        if (!boundNames.has(resource.name)) return resource.name;
        let index = 2;
        while (usedNames.has(`${resource.name}_${index}`)) index++;
        return `${resource.name}_${index}`;
      })();
    if (name !== resource.name) renames.set(resource.name, name);
    usedNames.add(name);
    boundNames.add(name);
    sourceBindings.set(resource.name, resource.key);
    if (existing) removals.push(node);
    else resources.set(name, { ...resource, name });
  }

  // Measurement-only blocks also follow a uniquely identified, renamed sensor.
  for (const sensor of sensors) {
    if (
      sourceBindings.has(sensor.variable) ||
      !canRename(incoming, source, sensor.variable)
    )
      continue;
    const matches = [...resources.values()].filter(
      (resource) =>
        resource.constructor === sensor.constructor &&
        (sensor.variable !== "photodiode" ||
          resource.key === "analogio.AnalogIn(board.PD_PIN)")
    );
    if (matches.length === 1 && matches[0].name !== sensor.variable)
      renames.set(sensor.variable, matches[0].name);
  }

  const setup = hasSetup
    ? rewrite(
        source.slice(0, setupEnd),
        parser.parse(source.slice(0, setupEnd)).topNode,
        renames,
        removals
      )
    : "";
  const mainSource = hasSetup ? source.slice(setupEnd) : source;
  const main = rewrite(
    mainSource,
    parser.parse(mainSource).topNode,
    renames,
    []
  );
  return {
    setup: setup
      ? `${
          setupFrom > 0 && document[setupFrom - 1] !== "\n" ? "\n" : ""
        }${setup}\n\n`
      : "",
    main,
    setupFrom,
  };
};

/** Used only for an unresolved object reported by the language server. */
export const missingSensorInitialization = (
  document: string,
  from: number,
  to: number
) => {
  const sensor = sensors.find(
    (sensor) => sensor.variable === document.slice(from, to)
  );
  if (!sensor) return;
  const node = parser.parse(document).resolveInner(from, 1);
  if (
    node.name === "VariableName" &&
    node.parent?.name === "MemberExpression" &&
    node.parent.firstChild?.from === from
  )
    return sensor;
  return;
};
