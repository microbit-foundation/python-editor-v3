import { TracebackScrollback } from "./project-hooks";

describe("TracebackScrollback", () => {
  it("matches tracebacks", () => {
    const tsb = new TracebackScrollback();
    const traceback = tsb.push(
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
    )!;
    expect(traceback.error).toEqual(
      "RuntimeError: maximum recursion depth exceeded"
    );
    expect(traceback.trace[0]).toEqual('File "main.py", line 7, in <module>');
    expect(traceback.trace[traceback.trace.length - 1]).toEqual(
      'File "main.py", line 5, in foo'
    );
  });
  it("finds the last one", () => {
    const tsb = new TracebackScrollback();
    const traceback = tsb.push(
      `Traceback (most recent call last):
  File "main.py", line 5, in foo
RuntimeError: 1
Traceback (most recent call last):
  File "main.py", line 5, in foo
RuntimeError: 2
`
        .replace(/[\r\n]/g, "\n")
        .replace(/\n/g, "\r\n")
    )!;
    expect(traceback.error).toEqual("RuntimeError: 2");
  });
});
