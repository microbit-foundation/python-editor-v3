/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { EditorState } from "@codemirror/state";
import { python } from "@codemirror/lang-python";
import { calculateChanges } from "./edits";
import { EditorView } from "@codemirror/view";

describe("edits", () => {
  const check = ({
    initial,
    additional,
    expected,
  }: {
    initial: string;
    additional: string;
    expected: string;
  }) => {
    const state = EditorState.create({
      doc: initial,
      extensions: [python()],
    });
    const view = new EditorView({ state });
    const transaction = state.update({
      changes: calculateChanges(state, additional),
    });
    view.dispatch(transaction);
    const actual = view.state.sliceDoc(0);
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
        "from microbit import *\nimport radio\n\nradio.off()\n\nwhile True:\n    display.scroll('Hello, World')\n",
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
});
