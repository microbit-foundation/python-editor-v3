/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { render } from "@testing-library/react";
import { ApiDocsEntry } from "../../language-server/apidocs";
import FixedTranslationProvider from "../../messages/FixedTranslationProvider";
import ScrollablePanel from "../../workbench/ScrollablePanel";
import ReferenceNode from "./ReferenceNode";

describe("ReferenceNode", () => {
  const node: ApiDocsEntry = {
    fullName: "microbit.compass",
    id: "microbit.compass",
    name: "compass",
    kind: "module",
    docString: "Totally magnetic!",
    children: [
      {
        fullName: "microbit.compass.get_x",
        id: "123",
        name: "get_x",
        kind: "function",
        docString: "Get me!\n\nNot initially displayed",
        params: [
          {
            name: "foo",
            category: "simple",
          },
          {
            name: "bar",
            category: "simple",
            defaultValue: "12",
          },
        ],
      },
    ],
  };

  it("renders", async () => {
    render(
      <FixedTranslationProvider>
        <ScrollablePanel>
          <ReferenceNode docs={node} />
        </ScrollablePanel>
      </FixedTranslationProvider>
    );
  });
});
