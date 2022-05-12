/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ApiDocsResponse } from "../../language-server/apidocs";
import { pullModulesToTop, resolveDottedName } from "./apidocs-util";

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

describe("resolveDottedName", () => {
  const docs: ApiDocsResponse = {
    microbit: {
      fullName: "microbit",
      id: "microbit",
      name: "microbit",
      kind: "module",
      children: [
        {
          fullName: "microbit.Button",
          name: "Button",
          kind: "class",
          id: "microbit.Button",
          children: [
            {
              fullName: "microbit.Button.is_pressed",
              kind: "function",
              id: "microbit.Button.is_pressed",
              name: "is_pressed",
            },
          ],
        },
      ],
    },
    "microbit.compass": {
      fullName: "microbit.compass",
      id: "microbit.compass",
      name: "compass",
      kind: "module",
      children: [
        {
          fullName: "microbit.compass.get_x",
          kind: "function",
          id: "microbit.compass.get_x",
          name: "get_x",
        },
      ],
    },
  };
  it("finds modules", () => {
    expect(resolveDottedName(docs, "microbit.compass")).toEqual(
      docs["microbit.compass"]
    );
    expect(resolveDottedName(docs, "microbit")).toEqual(docs["microbit"]);
  });
  it("finds classes", () => {
    expect(resolveDottedName(docs, "microbit.Button")?.fullName).toEqual(
      "microbit.Button"
    );
  });
  it("finds functions", () => {
    expect(resolveDottedName(docs, "microbit.compass.get_x")?.fullName).toEqual(
      "microbit.compass.get_x"
    );
  });
  it("finds class members", () => {
    expect(
      resolveDottedName(docs, "microbit.Button.is_pressed")?.fullName
    ).toEqual("microbit.Button.is_pressed");
  });
});
