/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { useStorage } from "./use-storage";

interface TestState {
  x: number;
  y: number;
  z: number;
}

const validate = (_o: unknown): _o is TestState => true;

const Test = () => {
  const [state, setState] = useStorage<TestState>(
    "local",
    "key",
    {
      x: 1,
      y: 1,
      z: 1,
    },
    validate
  );
  return (
    <div>
      <p data-testid="value">{state.x}</p>
      <button onClick={() => setState({ ...state, x: state.x + 1 })}>
        increment x
      </button>
    </div>
  );
};

describe("useLocalStorage", () => {
  it("reads/writes to/from local storage", () => {
    localStorage.setItem("key", JSON.stringify({ x: 9, y: 10, z: 11 }));

    render(<Test />);
    fireEvent.click(screen.getByText("increment x"));

    expect(JSON.parse(localStorage.getItem("key")!)).toEqual({
      x: 10,
      y: 10,
      z: 11,
    });
  });

  it("aligns top-level keys with default value", () => {
    localStorage.setItem("key", JSON.stringify({ a: 1, z: 11 }));

    render(<Test />);
    fireEvent.click(screen.getByText("increment x"));

    expect(JSON.parse(localStorage.getItem("key")!)).toEqual({
      x: 2,
      y: 1,
      z: 11,
    });
  });
});
