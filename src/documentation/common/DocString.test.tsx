/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { render } from "@testing-library/react";
import DocString from "./DocString";

describe("DocString", () => {
  it("works", () => {
    const markdown =
      "```python\ntestLib.Validator.read_write_prop (property)\n```\n---\nThe read-write property.";
    const view = render(<DocString value={markdown} />);
    expect(view.baseElement.innerHTML).toMatchInlineSnapshot(`
      "<div><div class="docs-spacing docs-code css-0"><pre><code class="language-python">testLib.Validator.read_write_prop (property)
      </code></pre>
      <hr>
      <p>The read-write property.</p>
      </div></div>"
    `);
  });
});
