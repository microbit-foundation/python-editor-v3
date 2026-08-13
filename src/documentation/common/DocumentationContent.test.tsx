/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 *
 * @vitest-environment jsdom
 */
import { render } from "@testing-library/react";
import { PortableText } from "../../common/sanity";
import DocumentationContent from "./DocumentationContent";

describe("DocumentationContent", () => {
  it("renders external links", () => {
    const content: PortableText = [
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
    const view = render(<DocumentationContent blocks={content} />);
    expect(view.container.innerHTML).toMatchInlineSnapshot(
      `"<div class="d_flex flex-d_column gap_3 mt_3"><p><a href="https://www.bbc.co.uk/bitesize/guides/zscvxfr/revision/4" target="_blank" rel="nofollow noopener" class="cursor_pointer td_none ring_none trs-prop_background-color,_border-color,_color,_fill,_stroke,_opacity,_box-shadow,_transform trs-dur_normal hover:td_underline focusVisible:focus-shadow_outline c_brand.600">Read more about ASCII<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" class="w_1em h_1em d_inline-block lh_1em flex-sh_0 fill_currentColor va_middle mb_0.333em ml_1" focusable="false" aria-hidden="true" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M10 6V8H5V19H16V14H18V20C18 20.5523 17.5523 21 17 21H4C3.44772 21 3 20.5523 3 20V7C3 6.44772 3.44772 6 4 6H10ZM21 3V11H19L18.9999 6.413L11.2071 14.2071L9.79289 12.7929L17.5849 5H13V3H21Z"></path></svg></a>.</p></div>"`
    );
  });

  it("renders images", () => {
    const content: PortableText = [
      {
        _type: "simpleImage",
        alt: "micro:bit showing X axis going across the front, Y axis going down and up, Z axis going back to front",
        asset: {
          _ref: "image-9fccaf51a164fedc98662188593de19bfb9be8ad-435x512-png",
          _type: "reference",
        },
      },
    ];
    const view = render(<DocumentationContent blocks={content} />);
    expect(view.container.innerHTML).toMatchInlineSnapshot(
      `"<div class="d_flex flex-d_column gap_3 mt_3"><div class="w_300px max-w_100% pos_relative before:content_&quot;&quot; before:d_block before:h_0 before:pb_var(--aspect-ratio-padding) [&amp;_>_*]:pos_absolute [&amp;_>_*]:inset_0 [&amp;_>_*]:w_100% [&amp;_>_*]:h_100%" style="--aspect-ratio-padding: 117.70114942528735%;"><img src="https://cdn.sanity.io/images/project/dataset/9fccaf51a164fedc98662188593de19bfb9be8ad-435x512.png?w=300&amp;q=80&amp;fit=max&amp;auto=format" alt="micro:bit showing X axis going across the front, Y axis going down and up, Z axis going back to front" class="max-w_100% bdr_lg bd_solid_1px bd-c_gray.300"></div></div>"`
    );
  });
});
