import { TracebackScrollback } from "./project-hooks";

describe("TracebackScrollback", () => {
  it("matches tracebacks", () => {
    const tb = new TracebackScrollback();
    tb.push(
      `
Misc output
>>> Other stuff
Not a traceback
Traceback (most recent call last):
  File "main.py", line 7, in <module>
  File "main.py", line 5, in foo
  File "main.py", line 5, in foo
  File "main.py", line 5, in foo
  File "main.py", line 5, in foo
  File "main.py", line 5, in foo
  File "main.py", line 5, in foo
  File "main.py", line 5, in foo
  File "main.py", line 5, in foo
  File "main.py", line 5, in foo
  File "main.py", line 5, in foo
  File "main.py", line 5, in foo
  File "main.py", line 5, in foo
  File "main.py", line 5, in foo
  File "main.py", line 5, in foo
  File "main.py", line 5, in foo
  File "main.py", line 5, in foo
  File "main.py", line 5, in foo
  File "main.py", line 5, in foo
  File "main.py", line 5, in foo
  File "main.py", line 5, in foo
  File "main.py", line 5, in foo
  File "main.py", line 5, in foo
  File "main.py", line 5, in foo
  File "main.py", line 5, in foo
  File "main.py", line 5, in foo
  File "main.py", line 5, in foo
  File "main.py", line 5, in foo
  File "main.py", line 5, in foo
  File "main.py", line 5, in foo
  File "main.py", line 5, in foo
  File "main.py", line 5, in foo
  File "main.py", line 5, in foo
  File "main.py", line 5, in foo
  File "main.py", line 5, in foo
  File "main.py", line 5, in foo
  File "main.py", line 5, in foo
  File "main.py", line 5, in foo
  File "main.py", line 5, in foo
RuntimeError: maximum recursion depth exceeded

>>> Other stuff
`
        .replace(/[\r\n]/g, "\n")
        .replace(/\n/g, "\r\n")
    );
    expect(tb.lastTraceback()).toMatch(/^Traceback/);
    expect(tb.lastTraceback()).toMatch(/exceeded$/);
  });
  it("finds the last one", () => {
    const tb = new TracebackScrollback();
    tb.push(
      `Traceback (most recent call last):
  File "main.py", line 5, in foo
RuntimeError: 1
Traceback (most recent call last):
  File "main.py", line 5, in foo
RuntimeError: 2
`
        .replace(/[\r\n]/g, "\n")
        .replace(/\n/g, "\r\n")
    );
    expect(tb.lastTraceback()).toMatch(/2$/);
  });
});
