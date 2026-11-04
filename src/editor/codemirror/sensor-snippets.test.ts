/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { python } from "@codemirror/lang-python";
import { history, redo, undo } from "@codemirror/commands";
import { EditorState, Transaction } from "@codemirror/state";
import { readFileSync } from "node:fs";
import { calculateChanges } from "./edits";
import {
  missingSensorInitialization,
  prepareSensorSnippet,
} from "./sensor-snippets";

const initBme =
  "import board\nimport adafruit_bme680\n\ni2c = board.I2C()\nbme680 = adafruit_bme680.Adafruit_BME680_I2C(i2c, address=0x76)";
const initUv =
  "import board\nfrom adafruit_veml6070 import VEML6070\n\ni2c = board.I2C()\nuv = VEML6070(i2c)";
const createState = (doc: string) =>
  EditorState.create({ doc, extensions: [python(), history()] });
const insert = (
  state: EditorState,
  source: string,
  line?: number,
  paste = false
) =>
  state.update(
    calculateChanges(state, source, "example", line, undefined, paste, true)
  ).state;
const combine = (document: string, source: string, line?: number) =>
  insert(createState(document), source, line).doc.toString();
const count = (source: string, fragment: string) =>
  source.split(fragment).length - 1;

describe("combining sensor snippets", () => {
  it("shares the external I2C bus and keeps constructors outside a loop", () => {
    const original = `${initBme}\n\nwhile True:\n    print(bme680.temperature)\n`;
    const result = combine(original, initUv, 7);
    expect(count(result, "board.I2C()")).toBe(1);
    expect(result).toContain("uv = VEML6070(i2c)");
    expect(result.indexOf("uv =")).toBeLessThan(result.indexOf("while True:"));
    expect(
      result.endsWith("while True:\n    print(bme680.temperature)\n")
    ).toBe(true);
  });

  it("reuses a bus under another name, including an aliased board import", () => {
    const result = combine("import board as pins\nbus = pins.I2C()\n", initUv);
    expect(count(result, ".I2C()")).toBe(1);
    expect(result).toContain("uv = VEML6070(bus)");
    expect(result).not.toContain("i2c =");
  });

  it("keeps internal and external I2C buses separate without overwriting names", () => {
    const imu =
      "import busio\nimport microcontroller\nimport adafruit_icm20x\nscl = microcontroller.pin.GPIO42\nsda = microcontroller.pin.GPIO45\ni2c = busio.I2C(scl, sda)\nimu = adafruit_icm20x.ICM20948(i2c, address=0x68)\n";
    const result = combine(imu, initBme);
    expect(result).toContain("i2c = busio.I2C(scl, sda)");
    expect(result).toContain("i2c_2 = board.I2C()");
    expect(result).toContain("Adafruit_BME680_I2C(i2c_2, address=0x76)");
    expect(result).toContain("ICM20948(i2c, address=0x68)");
  });

  it("preserves different frequencies and avoids already used suffixes", () => {
    const result = combine(
      "import busio\nimport board\ni2c = busio.I2C(board.SCL, board.SDA, frequency=100000)\ni2c_2 = 42\n",
      "import busio\nimport board\ni2c = busio.I2C(board.SCL, board.SDA, frequency=1000000)\n"
    );
    expect(result).toContain(
      "i2c_3 = busio.I2C(board.SCL, board.SDA, frequency=1000000)"
    );
    expect(result).toContain("i2c_2 = 42");
  });

  it("protects existing function names and destructured bindings", () => {
    for (const original of [
      "def i2c():\n    pass\n",
      "i2c, value = (1, 2)\n",
    ]) {
      expect(combine(original, initUv)).toContain("i2c_2 = board.I2C()");
    }
  });

  it("does not mistake a shadowed module for an imported bus constructor", () => {
    const result = combine(
      "import board\nboard = custom_board\nbus = board.I2C()\n",
      initUv
    );
    expect(count(result, "board.I2C()")).toBe(2);
  });

  it("compares syntax rather than whitespace and reuses named pin references", () => {
    const document =
      "import busio\nimport microcontroller\nclock = microcontroller.pin.GPIO42\ndata = microcontroller.pin.GPIO45\nbus = busio.I2C(clock, data)\n";
    const result = combine(
      document,
      "import busio\nimport microcontroller\nscl = microcontroller.pin.GPIO42\nsda = microcontroller.pin.GPIO45\ni2c = busio.I2C( scl , sda )\n"
    );
    expect(result).toBe(document);
  });

  it("does not allocate an identical sensor twice", () => {
    const original = `${initBme}\n`;
    expect(combine(original, initBme)).toBe(original);
  });

  it("reuses shared IO power pins when combining HDC1080 and DPS310", () => {
    const snippets = (name: string) =>
      [
        ...readFileSync(`content/de/sensoren/${name}.md`, "utf8").matchAll(
          /```python\n([\s\S]*?)```/g
        ),
      ].map((match) => match[1]);
    const result = combine(
      snippets("temperatur")[0],
      snippets("luftdruck-temperatur")[0]
    );
    expect(count(result, "DigitalInOut(board.IO_POWER)")).toBe(1);
    expect(count(result, "board.I2C()")).toBe(1);
    expect(result).toContain("sensor = HDC1080(i2c)");
    expect(result).toContain("dps310 = DPS310(i2c, 0x76)");
  });

  it("lets measurements use a uniquely identified sensor with a custom name", () => {
    const original = initBme.replaceAll("bme680 =", "environment =") + "\n";
    const result = combine(
      original,
      'value = bme680.temperature\nprint("bme680.temperature", value)'
    );
    expect(result).toContain("value = environment.temperature");
    expect(result).toContain('print("bme680.temperature", value)');
  });

  it("does not guess between multiple sensors of the same type", () => {
    const original =
      initBme.replace("bme680 =", "first =") +
      "\nsecond = adafruit_bme680.Adafruit_BME680_I2C(i2c, address=0x77)\n";
    expect(combine(original, "print(bme680.temperature)")).toContain(
      "print(bme680.temperature)"
    );
  });

  it("only reuses the photodiode input on its actual board pin", () => {
    const base =
      "import board\nimport analogio\ninput = analogio.AnalogIn(board.PD_PIN)\n";
    expect(combine(base, "print(photodiode.value)")).toContain(
      "print(input.value)"
    );
    expect(
      combine(
        base.replace("board.PD_PIN", "board.A0"),
        "print(photodiode.value)"
      )
    ).toContain("print(photodiode.value)");
  });

  it("does not rename a new initialization just because a measurement was inserted first", () => {
    const result = combine(
      "while True:\n    print(bme680.temperature)\n",
      initBme,
      2
    );
    expect(result).toContain(
      "bme680 = adafruit_bme680.Adafruit_BME680_I2C(i2c, address=0x76)"
    );
    expect(result).not.toContain("bme680_2");
    expect(result.indexOf("bme680 =")).toBeLessThan(
      result.indexOf("while True:")
    );
  });

  it.each([
    "print(bme680.temperature)\n",
    "temperature = bme680.temperature\n",
    "value = bme680.read()\n",
  ])(
    "initializes before an existing standalone measurement: %s",
    (measurement) => {
      const result = combine(measurement, initBme, 1);
      expect(result.indexOf("bme680 =")).toBeLessThan(
        result.indexOf(measurement.trim())
      );
    }
  );

  it("places measurements after setup even if pasted at the start", () => {
    const state = insert(
      createState(initBme),
      "print(bme680.temperature)",
      1,
      true
    );
    expect(state.doc.toString()).toContain(
      "address=0x76)\nprint(bme680.temperature)\n"
    );
  });

  it("keeps setup at top level when pasting a complete example into a loop", () => {
    const result = insert(
      createState("while True:\n    pass\n"),
      `${initBme}\nwhile True:\n    print(bme680.temperature)`,
      2,
      true
    ).doc.toString();
    expect(count(result, "while True:")).toBe(1);
    expect(result.indexOf("bme680 =")).toBeLessThan(
      result.indexOf("while True:")
    );
    expect(result).toContain("    print(bme680.temperature)\n    pass");
  });

  it("does not reuse conditional, local, reassigned or deinitialized buses", () => {
    for (const original of [
      "import board\nif enabled:\n    i2c = board.I2C()\n",
      "import board\ndef setup():\n    i2c = board.I2C()\n",
      "import board\ni2c = board.I2C()\ni2c = None\n",
      "import board\ni2c = board.I2C()\ni2c.deinit()\n",
    ]) {
      expect(count(combine(original, initUv), "board.I2C()")).toBe(2);
    }
  });

  it("leaves incomplete Python and complex local bindings untouched", () => {
    const incomplete = "if:\n";
    expect(
      prepareSensorSnippet(incomplete, "i2c = board.I2C()", "import board")
    ).toEqual({ setup: "", main: "i2c = board.I2C()", setupFrom: 0 });
    const source = "i2c = board.I2C()\ndef use(i2c):\n    return i2c";
    expect(
      prepareSensorSnippet(
        "import board\nbus = board.I2C()\n",
        source,
        "import board"
      ).main
    ).toBe(source);
  });

  it("does not rewrite keyword names, properties, comments or ordinary pasted code", () => {
    const source =
      'import board\ni2c = board.I2C()\nprint("i2c", i2c=i2c)\n# i2c stays in this comment';
    const result = combine("import board\nbus = board.I2C()\n", source);
    expect(result).toContain('print("i2c", i2c=bus)');
    expect(result).toContain("# i2c stays in this comment");
    const state = createState("import board\ni2c = board.I2C()\n");
    const ordinary = state
      .update(calculateChanges(state, initUv, "example"))
      .newDoc.toString();
    expect(count(ordinary, "board.I2C()")).toBe(2);
  });

  it("undoes and redoes setup and measurement insertion as one operation", () => {
    const original = "while True:\n    pass\n";
    let state = insert(
      createState(original),
      `${initBme}\nwhile True:\n    print(bme680.temperature)`,
      2
    );
    const inserted = state.doc.toString();
    const target = {
      get state() {
        return state;
      },
      dispatch: (transaction: Transaction) => {
        state = transaction.state;
      },
    };
    expect(undo(target)).toBe(true);
    expect(state.doc.toString()).toBe(original);
    expect(redo(target)).toBe(true);
    expect(state.doc.toString()).toBe(inserted);
  });

  it("combines every pair of shipped sensor initialization blocks into valid Python syntax", () => {
    const names = [
      "temperatur",
      "luftdruck-temperatur",
      "bme680",
      "beschleunigung",
      "helligkeit_uv",
      "photodiode",
      "vl53l8cx",
    ];
    const blocks = names.map(
      (name) =>
        /```python\n([\s\S]*?)```/.exec(
          readFileSync(`content/de/sensoren/${name}.md`, "utf8")
        )![1]
    );
    for (const first of blocks)
      for (const second of blocks) {
        const result = combine(first, second);
        const tree = python().language.parser.parse(result);
        let errors = 0;
        tree.iterate({
          enter: (node) => {
            if (node.type.isError) errors++;
          },
        });
        expect({ errors, result }).toMatchObject({ errors: 0 });
        expect(count(result, "board.I2C()")).toBeLessThanOrEqual(1);
      }
  });
});

describe("missing sensor initialization", () => {
  it.each(["sensor", "dps310", "bme680", "imu", "uv", "photodiode", "tof"])(
    "recognizes an unresolved %s object",
    (variable) => {
      expect(
        missingSensorInitialization(`${variable}.value`, 0, variable.length)
      ).toMatchObject({
        variable,
        block: expect.any(String),
        slug: expect.any(String),
      });
    }
  );
  it("does not label strings, comments, other names or bare variables as sensor reads", () => {
    for (const source of [
      '"bme680.temperature"',
      "# bme680.temperature",
      "other.temperature",
      "bme680 = 5",
    ]) {
      const from = Math.max(0, source.indexOf("bme680"));
      expect(
        missingSensorInitialization(source, from, from + 6)
      ).toBeUndefined();
    }
  });
});
