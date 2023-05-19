/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { fireEvent, render, screen } from "@testing-library/react";
import useRafState from "./use-raf-state";

const Test = () => {
  const [counter, setCounter] = useRafState(0);
  return (
    <div>
      <p>{counter}</p>
      <button onClick={() => setCounter(counter + 1)}>increment</button>
    </div>
  );
};

describe("useRafState", () => {
  it("works as per useState", async () => {
    render(<Test />);

    expect(screen.getByText("0")).toBeDefined();

    fireEvent.click(screen.getByText("increment"));

    await screen.findByText("1");
  });
});
