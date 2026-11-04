/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Traceback, TracebackScrollback } from "../device/device-hooks";
import english from "../../lang/ui.en.json";
import german from "../../lang/ui.de.json";
import {
  explainRuntimeError,
  projectErrorLocation,
} from "./runtime-error-help";

describe("runtime error explanations", () => {
  it.each([
    ["ValueError: No I2C device at address: 0x76", "i2c"],
    ["RuntimeError: No pull up found on SDA or SCL; check your wiring", "i2c"],
    ["OSError: I2C device not responding", "i2c"],
    ["ValueError: Pin in use", "pins"],
    ["RuntimeError: SDA in use", "pins"],
    ["ImportError: no module named 'adafruit_bme680'", "import"],
    ["ModuleNotFoundError: No module named 'unknown'", "import"],
    ["NameError: name 'bme680' is not defined", "name"],
    ["UnboundLocalError: local variable referenced before assignment", "name"],
    ["IndentationError: unexpected indent", "indentation"],
    ["TabError: inconsistent use of tabs and spaces", "indentation"],
    ["SyntaxError: invalid syntax", "syntax"],
    ["AttributeError: 'BME680' object has no attribute 'temp'", "attribute"],
    ["TypeError: unsupported types for __add__", "type"],
    ["ValueError: invalid literal for int()", "value"],
    ["ZeroDivisionError: division by zero", "division"],
    ["IndexError: list index out of range", "index"],
    ["KeyError: 'temperature'", "key"],
    ["MemoryError: memory allocation failed", "memory"],
    ["FileNotFoundError: data.txt", "file"],
    ["OSError: [Errno 2] No such file/directory", "file"],
    ["OSError: [Errno 30] Read-only filesystem", "readonly"],
    ["OSError: [Errno 5] Input/output error", "io"],
    ["OSError: [Errno 19] No such device", "io"],
    ["CustomError: bad data", "unknown"],
    ["RuntimeError: I2C simulation unavailable", "unknown"],
    ["Exception: No I2C device at address", "unknown"],
    ["", "unknown"],
  ])("explains %s as %s without losing the original", (error, kind) => {
    const explanation = explainRuntimeError(error);
    expect(explanation.kind).toBe(kind);
    for (const id of [explanation.description, ...explanation.steps]) {
      expect(english).toHaveProperty(id);
      expect(german).toHaveProperty(id);
    }
  });

  it("selects the nearest project frame rather than an installed library", () => {
    const traceback = new Traceback("OSError: device error", [
      'File "code.py", line 3, in <module>',
      'File "sensors.py", line 8, in measure',
      'File "/lib/adafruit_bme680.mpy", line 99, in temperature',
    ]);
    expect(projectErrorLocation(traceback, ["code.py", "sensors.py"])).toEqual({
      file: "sensors.py",
      line: 8,
    });
    expect(projectErrorLocation(traceback, ["code.py"])).toEqual({
      file: "code.py",
      line: 3,
    });
    expect(projectErrorLocation(traceback, [])).toBeUndefined();
  });

  it("accepts CircuitPython root paths and ignores invalid or unavailable locations", () => {
    for (const file of ["__main__", "/code.py", "./code.py"]) {
      expect(
        projectErrorLocation(
          new Traceback("NameError: x", [`File "${file}", line 2`]),
          ["code.py"]
        )
      ).toEqual({ file: "code.py", line: 2 });
    }
    for (const frame of [
      'File "<stdin>", line 1',
      'File "code.py", line 0',
      'File "../code.py", line 1',
      'File "code.py", line 999999999999999999999',
    ]) {
      expect(
        projectErrorLocation(new Traceback("NameError: x", [frame]), [
          "code.py",
        ])
      ).toBeUndefined();
    }
  });
});

describe("serial traceback input for error help", () => {
  it("handles LF and CRLF, split packets and an incomplete error line", () => {
    for (const newline of ["\n", "\r\n"]) {
      const buffer = new TracebackScrollback();
      expect(
        buffer.push(
          `Traceback (most recent call last):${newline}  File "code.py", line 3${newline}`
        )
      ).toBeUndefined();
      expect(buffer.push("NameError: name 'sen")?.error).toBe(
        "NameError: name 'sen"
      );
      const traceback = buffer.push(`sor' is not defined${newline}`)!;
      expect(traceback.error).toBe("NameError: name 'sensor' is not defined");
      expect(explainRuntimeError(traceback.error).kind).toBe("name");
    }
  });

  it("preserves the newest traceback when a small packet exceeds the buffer limit", () => {
    const buffer = new TracebackScrollback();
    const initial =
      'x\nTraceback (most recent call last):\n  File "code.py", line 3\nNameError: sensor\n';
    buffer.push(initial + "x".repeat(4096 - initial.length));
    expect(buffer.push("zz")?.error).toBe("NameError: sensor");
  });

  it("clears on reset and does not explain a user interruption", () => {
    const buffer = new TracebackScrollback();
    buffer.push(
      'Traceback (most recent call last):\n  File "code.py", line 3\nNameError: sensor\n'
    );
    buffer.clear();
    expect(buffer.push("hello\n")).toBeUndefined();
    expect(
      buffer.push(
        'Traceback (most recent call last):\n  File "code.py", line 3\nKeyboardInterrupt:\n'
      )
    ).toBeUndefined();
  });
});
