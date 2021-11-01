/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { render } from "@testing-library/react";
import { renderMarkdown } from "../editor/codemirror/language-server/documentation";
import DocString from "./DocString";

describe("DocString", () => {
  it("works", () => {
    const markdown =
      "```python\ntestLib.Validator.read_write_prop (property)\n```\n---\nThe read-write property.";
    const rendered = render(<DocString value={markdown} />);
    expect(rendered.baseElement.innerHTML).toMatchInlineSnapshot(`
      "<div><div class=\\"docs-markdown css-1fg01m6\\"><pre><code class=\\"language-python\\">testLib.Validator.read_write_prop (property)
      </code></pre>
      <hr>
      <p>The read-write property.</p>
      </div></div>"
    `);
  });
});
