import { render, prettyDOM } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { ApiDocsEntry } from "../language-server/apidocs";
import FixedTranslationProvider from "../messages/FixedTranslationProvider";
import ApiDocsEntryNode from "./ApiDocsEntryNode";

describe("ApiDocsEntryNode", () => {
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

  it("Show more / less", async () => {
    const result = render(
      <FixedTranslationProvider>
        <ApiDocsEntryNode docs={node} />
      </FixedTranslationProvider>
    );
    // Before "Show more" we have first paragraph of docs and no defaulted parameters.
    expect(
      result.queryByText("Not initially displayed")
    ).not.toBeInTheDocument();
    expect(result.queryByText("(foo)")).toBeInTheDocument();

    const showMoreButton = await result.findByRole("button", {
      name: /Show more/,
    });
    act(() => {
      showMoreButton.click();
    });

    expect(result.queryByText("Not initially displayed")).toBeInTheDocument();
    expect(result.queryByText("(foo, bar=12)")).toBeInTheDocument();
  });

  let commands: string[] = [];

  beforeEach(() => {
    commands.length = 0;
    document.execCommand = (command) => {
      commands.push(command);
      return true;
    };
  });

  afterEach(() => {
    (document as any).execCommand = undefined;
  });

  it("offers copy-to-clipboard for the signature", async () => {
    const result = render(
      <FixedTranslationProvider>
        <ApiDocsEntryNode docs={node} />
      </FixedTranslationProvider>
    );

    const copyButton = await result.findByRole("button", {
      name: /Copy/,
    });
    act(() => {
      copyButton.click();
    });

    expect(commands).toEqual(["copy"]);
  });
});
