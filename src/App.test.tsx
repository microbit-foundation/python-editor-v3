import { render } from "@testing-library/react";
import App from "./App";

test("renders", async () => {
  const app = render(<App />);
  await app.findAllByRole("button", { name: "Load…" });
});
