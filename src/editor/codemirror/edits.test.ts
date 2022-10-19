/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { python } from "@codemirror/lang-python";
import { EditorState } from "@codemirror/state";
import { calculateChanges } from "./edits";
import { CodeInsertType } from "./dnd";

describe("edits", () => {
  const check = ({
    initial,
    additional,
    expected,
    line,
    indentLevelHint,
    type,
  }: {
    initial: string;
    additional: string;
    expected: string;
    line?: number;
    indentLevelHint?: number;
    type?: CodeInsertType;
  }) => {
    // Tabs are more maintainable in the examples but we actually work with 4 space indents.
    initial = initial.replaceAll("\t", "    ");
    additional = additional.replaceAll("\t", "    ");
    expected = expected.replaceAll("\t", "    ");

    const state = EditorState.create({
      doc: initial,
      extensions: [python()],
    });
    const transaction = state.update(
      calculateChanges(
        state,
        additional,
        type ?? "example",
        line,
        indentLevelHint
      )
    );
    const actual = transaction.newDoc.sliceString(0);
    const expectedSelection = expected.indexOf("█");
    expect(actual).toEqual(expected.replace("█", ""));
    if (expectedSelection !== -1) {
      expect(transaction.newSelection.ranges[0].from).toEqual(
        expectedSelection
      );
    }
  };

  it("first import from case - wildcard", () => {
    check({
      initial: "",
      additional: "from microbit import *",
      expected: "from microbit import *\n\n\n",
    });
  });

  it("first import from case - name", () => {
    check({
      initial: "",
      additional: "from random import randrange",
      expected: "from random import randrange\n\n\n",
    });
  });

  it("first import module case", () => {
    check({
      initial: "",
      additional: "import audio",
      expected: "import audio\n\n\n",
    });
  });

  it("existing import module case", () => {
    check({
      initial: "import audio",
      additional: "import audio",
      expected: "import audio",
    });
  });

  it("existing import module case - as variant", () => {
    check({
      initial: "import audio as foo",
      additional: "import audio",
      expected: "import audio as foo\nimport audio\n",
    });
  });

  it("existing import from case - wildcard", () => {
    check({
      initial: "from microbit import *",
      additional: "from microbit import *",
      expected: "from microbit import *",
    });
  });

  it("existing import from case - name", () => {
    check({
      initial: "from random import randrange",
      additional: "from random import randrange",
      expected: "from random import randrange",
    });
  });

  it("existing import from case - alias", () => {
    check({
      initial: "from random import randrange as foo",
      additional: "from random import randrange",
      expected: "from random import randrange as foo, randrange",
    });
  });

  it("existing from import new name", () => {
    check({
      initial: "from random import getrandbits",
      additional: "from random import randrange",
      expected: "from random import getrandbits, randrange",
    });
  });

  it("copes with invalid imports", () => {
    check({
      initial: "import\nfrom\n",
      additional: "from random import randrange",
      expected: "from random import randrange\n\n\nimport\nfrom\n",
    });
  });

  it("combo imports", () => {
    check({
      initial:
        "from microbit import *\nfrom random import randrange\nimport radio\n",
      additional:
        "from microbit import *\nfrom random import rantint\nimport micropython\n",
      expected:
        "from microbit import *\nfrom random import randrange, rantint\nimport radio\nimport micropython\n",
    });
  });

  it("non-import content separated and appended", () => {
    check({
      initial: "from microbit import *",
      additional:
        "from microbit import *\nwhile True:\n    display.scroll('Hello, World')\n",
      expected:
        "from microbit import *\nwhile True:\n    display.scroll('Hello, World')\n",
    });
  });

  it("non-import content separated and existing content", () => {
    check({
      initial:
        "from microbit import *\n\nwhile True:\n    display.scroll('Hello, World')\n",
      additional: "import radio\n\nradio.off()",
      expected:
        "from microbit import *\nimport radio\n\nradio.off()\nwhile True:\n    display.scroll('Hello, World')\n",
    });
  });

  it("non-import content before code rather than after imports", () => {
    check({
      initial: "from microbit import *\n\n\n\nprint('foo')",
      additional: "print('bar')",
      expected: "from microbit import *\n\n\n\nprint('bar')\nprint('foo')",
    });
  });

  it("multiple imports into empty doc", () => {
    check({
      initial: "",
      additional:
        "from microbit import *\nimport music\n\n\ndisplay.scroll('score', delay=100, loop=True, wait=False)\nmusic.play(music.ODE)\n",
      expected:
        "from microbit import *\nimport music\n\n\ndisplay.scroll('score', delay=100, loop=True, wait=False)\nmusic.play(music.ODE)\n",
    });
  });

  it("can insert at first line", () => {
    check({
      line: 1,
      initial: "from microbit import *\npass",
      additional: "print('Hi')",
      expected: "print('Hi')\nfrom microbit import *\npass",
    });
  });
  it("can insert at last line", () => {
    check({
      line: 3,
      initial: "from microbit import *\npass",
      additional: "print('Hi')",
      expected: "from microbit import *\npass\nprint('Hi')\n",
    });
  });
  it("can insert in the middle", () => {
    check({
      line: 2,
      initial: "from microbit import *\npass",
      additional: "print('Hi')",
      expected: "from microbit import *\nprint('Hi')\npass",
    });
  });
  it("can insert beyond the end of the document by adding blank lines", () => {
    check({
      line: 5,
      initial: "from microbit import *\npass",
      additional: "print('Hi')",
      expected: "from microbit import *\npass\n\n\nprint('Hi')\n",
    });
  });
  it("can insert into empty document", () => {
    check({
      initial: "",
      additional: "pass",
      expected: "pass\n",
    });
  });
  it("still separates imports even when inserting at a line", () => {
    check({
      line: 5,
      initial: "pass",
      additional: "import radio\nradio.off()",
      expected: "import radio\n\n\npass\nradio.off()\n",
    });
  });
  it("while True inside while True is a special case", () => {
    check({
      line: 2,
      initial: "while True:\n    a = 1\n",
      additional: "while True:\n    b = 2\n",
      expected: "while True:\n    b = 2\n    a = 1\n",
      type: "example",
    });
  });
  it("while True inside while True is a special case even when inserting after document end", () => {
    check({
      line: 10,
      initial: "while True:\n    a = 1\n",
      additional: "while True:\n    b = 2\n",
      expected: `while True:\n    a = 1\n${"\n".repeat(7)}    b = 2\n`,
      type: "example",
    });
  });
  it("inside while False is not a special case", () => {
    check({
      line: 2,
      initial: "while False:\n    a = 1\n",
      additional: "while True:\n    b = 2\n",
      expected: "while False:\n    while True:\n        b = 2\n    a = 1\n",
      type: "example",
    });
  });

  it("moves selection into function brackets of callable code with empty editor at line 0", () => {
    check({
      line: 0,
      initial: "",
      additional: "import math\nmath.asin()",
      expected: "import math\n\n\nmath.asin(█)\n",
      type: "call",
    });
  });
  it("moves selection into function brackets of callable code with empty editor at line 7", () => {
    check({
      line: 7,
      initial: "",
      additional: "import math\nmath.asin()",
      expected: "import math\n\n\n\n\n\nmath.asin(█)\n",
      type: "call",
    });
  });
  it("moves selection into function brackets of callable code with existing import", () => {
    check({
      line: 7,
      initial: "import math",
      additional: "import math\nmath.asin()",
      expected: "import math\n\n\n\n\n\nmath.asin(█)\n",
      type: "call",
    });
  });
  it("moves selection into function brackets of callable code when inserted into indented block", () => {
    check({
      line: 7,
      initial:
        "from microbit import *\n\n\n\nwhile True:\n\tdisplay.scroll('micro:bit')\n",
      additional: "import math\nmath.asin()",
      expected:
        "from microbit import *\nimport math\n\n\n\nwhile True:\n\tmath.asin(█)\n\tdisplay.scroll('micro:bit')\n",
      type: "call",
    });
  });
  it("moves selection into function brackets of callable code when inserted into indented block with existing import", () => {
    check({
      line: 7,
      initial:
        "from microbit import *\nimport math\n\n\n\nwhile True:\n\tdisplay.scroll('micro:bit')\n",
      additional: "import math\nmath.asin()",
      expected:
        "from microbit import *\nimport math\n\n\n\nwhile True:\n\tmath.asin(█)\n\tdisplay.scroll('micro:bit')\n",
      type: "call",
    });
  });

  it("moves selection to start of multiline code example with empty editor at line 0", () => {
    check({
      line: 0,
      initial: "",
      additional:
        "from microbit import *\nwhile True:\n\tdisplay.scroll('micro:bit')",
      expected:
        "from microbit import *\n\n\n█while True:\n\tdisplay.scroll('micro:bit')\n",
      type: "example",
    });
  });
  it("moves selection to start of multiline code example with empty editor at line 7", () => {
    check({
      line: 7,
      initial: "",
      additional:
        "from microbit import *\nwhile True:\n\tdisplay.scroll('micro:bit')",
      expected:
        "from microbit import *\n\n\n\n\n\n█while True:\n\tdisplay.scroll('micro:bit')\n",
      type: "example",
    });
  });
  it("moves selection to start of multiline code example with existing import", () => {
    check({
      line: 7,
      initial: "from microbit import *",
      additional:
        "from microbit import *\nwhile True:\n\tdisplay.scroll('micro:bit')",
      expected:
        "from microbit import *\n\n\n\n\n\n█while True:\n\tdisplay.scroll('micro:bit')\n",
      type: "example",
    });
  });
  it("moves selection to start of multiline code example when inserted into indented block", () => {
    check({
      line: 5,
      initial: "while True:\n\tprint('')",
      additional:
        "from microbit import *\ndisplay.scroll('score')\ndisplay.scroll(23)",
      expected:
        "from microbit import *\n\n\nwhile True:\n\t█display.scroll('score')\n\tdisplay.scroll(23)\n\tprint('')",
      type: "example",
    });
  });
  it("moves selection to start of multiline code example when inserted into indented block with existing import", () => {
    check({
      line: 4,
      initial: "from microbit import *\n\nwhile True:\n\tprint('')",
      additional:
        "from microbit import *\ndisplay.scroll('score')\ndisplay.scroll(23)",
      expected:
        "from microbit import *\n\nwhile True:\n\t█display.scroll('score')\n\tdisplay.scroll(23)\n\tprint('')",
      type: "example",
    });
  });

  it("moves selection to end of single line code example with empty editor at line 0", () => {
    check({
      line: 0,
      initial: "",
      additional: "from microbit import *\ndisplay.scroll('score')",
      expected: "from microbit import *\n\n\ndisplay.scroll('score')█\n",
      type: "example",
    });
  });
  it("moves selection to end of single line code example with empty editor at line 7", () => {
    check({
      line: 7,
      initial: "",
      additional: "from microbit import *\ndisplay.scroll('score')",
      expected: "from microbit import *\n\n\n\n\n\ndisplay.scroll('score')█\n",
      type: "example",
    });
  });
  it("moves selection to end of single line code example with existing import", () => {
    check({
      line: 7,
      initial: "from microbit import *",
      additional: "from microbit import *\ndisplay.scroll('score')",
      expected: "from microbit import *\n\n\n\n\n\ndisplay.scroll('score')█\n",
      type: "example",
    });
  });
  it("moves selection to end of single line code example when inserted into indented block", () => {
    check({
      line: 5,
      initial: "while True:\n\tprint('')",
      additional: "from microbit import *\ndisplay.scroll('score')",
      expected:
        "from microbit import *\n\n\nwhile True:\n\tdisplay.scroll('score')█\n\tprint('')",
      type: "example",
    });
  });
  it("moves selection to end of single line code example when inserted into indented block with existing import", () => {
    check({
      line: 4,
      initial: "from microbit import *\n\nwhile True:\n\tprint('')",
      additional: "from microbit import *\ndisplay.scroll('score')",
      expected:
        "from microbit import *\n\nwhile True:\n\tdisplay.scroll('score')█\n\tprint('')",
      type: "example",
    });
  });
  it("is not misled by whitespace on blank lines - 1", () => {
    check({
      line: 3,
      initial: "while True:\n    print('Hi')\n   \n",
      additional: "print('Bye')",
      expected: "while True:\n    print('Hi')\n    print('Bye')\n   \n",
      type: "example",
    });
  });
  it("is not misled by whitespace on blank lines - 2", () => {
    check({
      line: 2,
      initial: "while True:\n  \n    print('Hi')\n",
      additional: "print('Bye')",
      expected: "while True:\n    print('Bye')\n  \n    print('Hi')\n",
      type: "example",
    });
  });
  it("uses indent hint", () => {
    check({
      line: 3,
      initial: "if True:\n\tprint('a')\n",
      additional: "print('b')",
      expected: "if True:\n\tprint('a')\nprint('b')\n",
      type: "example",
      // This pulls it back a level
      indentLevelHint: 0,
    });

    check({
      line: 3,
      initial: "if True:\n\tprint('a')\n",
      additional: "print('b')",
      expected: "if True:\n\tprint('a')\n\tprint('b')\n",
      type: "example",
      indentLevelHint: 1,
    });
  });
  it("ignores indent hint when greater than calculated indent", () => {
    check({
      line: 3,
      initial: "if True:\n\tprint('a')\n",
      additional: "print('b')",
      expected: "if True:\n\tprint('a')\n\tprint('b')\n",
      type: "example",
      // This is ignored
      indentLevelHint: 2,
    });
  });
  it("ignores indent hint when appending to while true", () => {
    check({
      line: 3,
      initial: "while True:\n\tprint('a')\n",
      additional: "print('b')",
      expected: "while True:\n\tprint('a')\n\tprint('b')\n",
      type: "example",
      // This is ignored to make it easy to build typical while True micro:bit programs.
      indentLevelHint: 0,
    });
  });
  it("uses indent hint when nested in while True", () => {
    check({
      line: 4,
      initial: "while True:\n\tif True:\n\t\tprint('a')\n\tpass\n",
      additional: "print('b')",
      expected:
        "while True:\n\tif True:\n\t\tprint('a')\n\tprint('b')\n\tpass\n",
      type: "example",
      // By default it would indent under the if.
      indentLevelHint: 1,
    });
  });
  it("limits use of indent hint based on following line indent", () => {
    check({
      line: 4,
      initial: "if True:\n\tif True:\n\t\tprint('a')\n\tprint('b')\n",
      additional: "print('c')",
      expected:
        "if True:\n\tif True:\n\t\tprint('a')\n\tprint('c')\n\tprint('b')\n",
      type: "example",
      // By default it would indent under the if.
      indentLevelHint: 0,
    });
  });
  it("uses correct preceding line for indent at end of document", () => {
    check({
      line: 2,
      initial: "if True:",
      additional: "pass",
      expected: "if True:\n\tpass\n",
      type: "example",
    });
  });
});
