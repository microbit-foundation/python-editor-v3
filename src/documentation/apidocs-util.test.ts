import { ApiDocsResponse } from "../language-server/apidocs";
import { pullModulesToTop } from "./apidocs-util";

describe("pullModulesToTop", () => {
  it("pulls modules up", () => {
    const mutated: ApiDocsResponse = {
      microbit: {
        kind: "module",
        fullName: "microbit",
        id: "microbit",
        name: "microbit",
        children: [
          {
            kind: "module",
            fullName: "microbit.compass",
            id: "microbit.compass",
            name: "compass",
          },
          {
            kind: "module",
            fullName: "microbit.display",
            id: "microbit.display",
            name: "display",
          },
          {
            kind: "variable",
            fullName: "microbit.display.foo",
            id: "foo",
            name: "foo",
          },
        ],
      },
    };
    pullModulesToTop(mutated);
    expect(mutated).toEqual({
      microbit: {
        kind: "module",
        fullName: "microbit",
        id: "microbit",
        name: "microbit",
        children: [
          {
            kind: "variable",
            fullName: "microbit.display.foo",
            id: "foo",
            name: "foo",
          },
        ],
      },
      "microbit.compass": {
        kind: "module",
        fullName: "microbit.compass",
        id: "microbit.compass",
        name: "compass",
      },
      "microbit.display": {
        kind: "module",
        fullName: "microbit.display",
        id: "microbit.display",
        name: "display",
      },
    });
  });
});
