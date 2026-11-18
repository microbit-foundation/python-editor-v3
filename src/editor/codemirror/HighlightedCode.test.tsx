/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { render } from "@testing-library/react";
import HighlightedCode from "./HighlightedCode";

const renderLines = (code: string) => {
  const view = render(<HighlightedCode code={code} />);
  return Array.from(
    view.container.querySelectorAll("[translate=no] > div")
  ).map((line) => ({
    text: line.textContent,
    blank: line.querySelector("br") !== null,
  }));
};

describe("HighlightedCode", () => {
  it("renders one element per line, with blank lines kept", () => {
    expect(renderLines("import microbit\n\nmicrobit.reset()\n")).toEqual([
      { text: "import microbit", blank: false },
      { text: "", blank: true },
      { text: "microbit.reset()", blank: false },
      { text: "", blank: true },
    ]);
  });

  it("treats CRLF and CR as line breaks", () => {
    expect(renderLines("a = 1\r\n\r\nb = 2\rc = 3")).toEqual([
      { text: "a = 1", blank: false },
      { text: "", blank: true },
      { text: "b = 2", blank: false },
      { text: "c = 3", blank: false },
    ]);
  });

  it("highlights with the editor's classes", () => {
    const view = render(<HighlightedCode code={"while True:\n    pass"} />);
    const keyword = Array.from(view.container.querySelectorAll("span")).find(
      (span) => span.textContent === "while"
    );
    expect(keyword?.className).toBeTruthy();
  });
});
