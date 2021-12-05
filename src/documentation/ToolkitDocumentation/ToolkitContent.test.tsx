import { render } from "@testing-library/react";
import { ToolkitPortableText } from "./model";
import ToolkitContent from "./ToolkitContent";

describe("ToolkitContent", () => {
  it("renders external links", () => {
    const content: ToolkitPortableText = [
      {
        _key: "aa98d45c4830",
        _type: "block",
        children: [
          {
            _key: "5a0241bfeeae",
            _type: "span",
            marks: ["077a4155134d"],
            text: "Read more about ASCII",
          },
          {
            _key: "9288bd174f02",
            _type: "span",
            marks: [],
            text: ".",
          },
        ],
        markDefs: [
          {
            _type: "link",
            _key: "077a4155134d",
            href: "https://www.bbc.co.uk/bitesize/guides/zscvxfr/revision/4",
          },
        ],
        style: "normal",
      },
    ];
    const rendered = render(<ToolkitContent content={content} />);
    expect(rendered.container.innerHTML).toMatchInlineSnapshot(
      `"<p><a target=\\"_blank\\" rel=\\"nofollow noopener\\" class=\\"chakra-link css-1w3ukj\\" href=\\"https://www.bbc.co.uk/bitesize/guides/zscvxfr/revision/4\\">Read more about ASCII</a>.</p>"`
    );
  });
});
