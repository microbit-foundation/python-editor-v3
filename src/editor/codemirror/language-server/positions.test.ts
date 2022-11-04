import { Text } from "@codemirror/state";
import { positionToOffset } from "./positions";

describe("positionToOffset", () => {
  it("empty doc", () => {
    const doc = Text.of([""]);
    expect(
      positionToOffset(doc, {
        line: 0,
        character: 0,
      })
    ).toEqual(0);

    expect(
      positionToOffset(doc, {
        line: 1,
        character: 0,
      })
    ).toBeUndefined();

    expect(
      positionToOffset(doc, {
        line: 0,
        character: 1,
      })
    ).toBeUndefined();
  });

  it("1 char doc", () => {
    const doc = Text.of(["x"]);
    expect(
      positionToOffset(doc, {
        line: 0,
        character: 0,
      })
    ).toEqual(0);

    expect(
      positionToOffset(doc, {
        line: 0,
        character: 1,
      })
    ).toEqual(1);

    expect(
      positionToOffset(doc, {
        line: 0,
        character: 2,
      })
    ).toBeUndefined();
  });

  it("2 line doc", () => {
    const doc = Text.of(["x", "y"]);
    expect(
      positionToOffset(doc, {
        line: 0,
        character: 0,
      })
    ).toEqual(0);

    expect(
      positionToOffset(doc, {
        line: 1,
        character: 0,
      })
    ).toEqual(2);

    expect(
      positionToOffset(doc, {
        line: 1,
        character: 1,
      })
    ).toEqual(3);

    expect(
      positionToOffset(doc, {
        line: 1,
        character: 2,
      })
    ).toBeUndefined();
  });

  it("maps to incorrect line", () => {
    const doc = Text.of(["hello", "there"]);
    // Initial checks to confirm boundary
    expect(
      positionToOffset(doc, {
        line: 0,
        character: 5,
      })
    ).toEqual(5);
    expect(doc.sliceString(0, 5)).toEqual("hello");
    // Actual test that goes one too far
    expect(
      positionToOffset(doc, {
        line: 0,
        character: 6,
      })
    ).toBeUndefined();
  });
});
