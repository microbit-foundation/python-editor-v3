import { TimeoutError, withTimeout } from "./async-util";

describe("withTimeout", () => {
  it("times out", async () => {
    const neverResolves = new Promise(() => {});
    await expect(() => withTimeout(neverResolves, 0)).rejects.toThrowError(
      TimeoutError
    );
  });
  it("returns the value", async () => {
    const resolvesWithValue = async () => "foo";
    expect(await withTimeout(resolvesWithValue(), 10)).toEqual("foo");
  });
});
