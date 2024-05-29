/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ApiDocsContent } from "../../language-server/apidocs";
import { moduleAndApiFromId, pullModulesToTop } from "./apidocs-util";

describe("pullModulesToTop", () => {
  it("pulls modules up", () => {
    const mutated: ApiDocsContent = {
      languageId: "en",
      content: {
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
      },
    };
    pullModulesToTop(mutated);
    expect(mutated.content).toEqual({
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

describe("moduleAndApiFromId", () => {
  it("correctly splits module and apiId from id with three segments", () => {
    const id = "microbit.display.scroll";
    const { pythonModuleName, apiId } = moduleAndApiFromId(id);
    expect(pythonModuleName).toEqual("microbit");
    expect(apiId).toEqual("display.scroll");
  });
  it("correctly splits module and apiId from id with two segments", () => {
    const id = "log.add";
    const { pythonModuleName, apiId } = moduleAndApiFromId(id);
    expect(pythonModuleName).toEqual("log");
    expect(apiId).toEqual("add");
  });
  it("correctly splits module and apiId from id with one segment", () => {
    const id = "gc";
    const { pythonModuleName, apiId } = moduleAndApiFromId(id);
    expect(pythonModuleName).toEqual("gc");
    expect(apiId).toEqual("");
  });
});
