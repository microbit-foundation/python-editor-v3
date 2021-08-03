/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 * 
 * @jest-environment ./src/testing/custom-browser-env
 */
import { render } from "@testing-library/react";
import App from "./App";

test("renders", async () => {
  const app = render(<App />);
  await app.findAllByRole("button", { name: "Load…" });
});
