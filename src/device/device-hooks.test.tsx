import { TracebackScrollback } from "./device-hooks";

const toCrLf = (text: string): string =>
  text.replace(/[\r\n]/g, "\n").replace(/\n/g, "\r\n");

describe("TracebackScrollback", () => {
  it("matches tracebacks", () => {
    const tsb = new TracebackScrollback();
    const traceback = tsb.push(
      toCrLf(`
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
`)
    )!;
    expect(traceback.error).toEqual(
      "RuntimeError: maximum recursion depth exceeded"
    );
    expect(traceback.trace[0]).toEqual('File "main.py", line 7, in <module>');
    expect(traceback.trace[traceback.trace.length - 1]).toEqual(
      'File "main.py", line 5, in foo'
    );
    expect(traceback.line).toEqual(5);
    expect(traceback.file).toEqual("main.py");
  });
  it("finds the last one", () => {
    const tsb = new TracebackScrollback();
    const traceback = tsb.push(
      toCrLf(`Traceback (most recent call last):
  File "main.py", line 5, in foo
RuntimeError: 1
Traceback (most recent call last):
  File "main.py", line 5, in foo
RuntimeError: 2
`)
    )!;
    expect(traceback.error).toEqual("RuntimeError: 2");
  });

  it("skips direct REPL interaction as indicated by <stdin>", () => {
    const tsb = new TracebackScrollback();
    const traceback = tsb.push(
      toCrLf(`>>> bar()
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
  File "main.py", line 5, in bar
ValueError: Wow!`)
    );

    expect(traceback).toBeUndefined();
  });

  it("skips direct REPL interaction as indicated by KeyboardInterrupt", () => {
    const tsb = new TracebackScrollback();
    const traceback = tsb.push(
      toCrLf(`Traceback (most recent call last):
  File "main.py", line 10, in <module>
KeyboardInterrupt:`)
    );

    expect(traceback).toBeUndefined();
  });

  it("identifies file and line from last line of trace", () => {
    const tsb = new TracebackScrollback();
    const traceback = tsb.push(
      toCrLf(`Traceback (most recent call last):
  File "main.py", line 10, in <module>
  File "foo.py", line 11, in <module>
  File "bar.py", line 12, in <module>
InsufficientCaffine:`)
    )!;

    expect(traceback.file).toBe("bar.py");
    expect(traceback.line).toBe(12);
  });

  it("limits scrollback", () => {
    const tsb = new TracebackScrollback();
    let traceback;
    traceback = tsb.push(
      toCrLf(`Traceback (most recent call last):
  File "main.py", line 10, in <module>
SomeError:
`)
    )!;
    expect(traceback).toBeDefined();
    traceback = tsb.push(toCrLf("0".repeat(5000)))!;
    expect(traceback).toBeUndefined();
  });
});
