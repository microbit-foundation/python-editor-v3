/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { python } from "@codemirror/lang-python";
import { EditorState } from "@codemirror/state";
import { calculateChanges } from "./edits";

describe("edits", () => {
  const check = ({
    initial,
    additional,
    expected,
    line,
  }: {
    initial: string;
    additional: string;
    expected: string;
    line?: number;
  }) => {
    const state = EditorState.create({
      doc: initial,
      extensions: [python()],
    });
    const transaction = state.update(calculateChanges(state, additional, line));
    const actual = transaction.newDoc.sliceString(0);
    expect(actual).toEqual(expected);
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
});
