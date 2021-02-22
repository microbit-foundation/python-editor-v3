import fs from "fs";
import { PythonEnvironment, PythonPath } from "./analyze";

describe("api info", () => {
  // This needs splitting up and expanding, but keeping it exploratory for now.
  test("works", () => {
    const pythonPath: PythonPath = (path) => {
      return fs.readFileSync("src/apis/example/" + path + ".py", {
        encoding: "utf-8",
      });
    };
    const environment = new PythonEnvironment(pythonPath);
    const module = environment.loadModule("example");
    expect(module.names().names).toEqual(
      new Set([
        "foo",
        "notFoo",
        "barA",
        "barB",
        "blortA",
        "moduleVar",
        "exampleFunction",
        "ExampleClass",
        "instance",
      ])
    );
  });
});
