/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { MemoryRouter } from "react-router";
import { Result } from "./common";
import SearchResultList from "./SearchResultList";

describe("SearchResultList", () => {
  it("marks matched terms so assistive technology can announce them", () => {
    const result: Result = {
      id: "loops",
      navigation: { tab: "reference", slug: { id: "loops" } },
      containerTitle: "Loops",
      title: "Loops",
      extract: {
        title: [{ type: "match", extract: "Loops" }],
        content: [
          { type: "match", extract: "Loops" },
          { type: "text", extract: " repeat sections of code." },
        ],
      },
    };
    render(
      <IntlProvider locale="en">
        <MemoryRouter>
          <SearchResultList
            title="Reference"
            results={[result]}
            viewedResults={[]}
            onViewResult={() => {}}
          />
        </MemoryRouter>
      </IntlProvider>
    );
    const marks = screen.getAllByRole("mark");
    expect(marks.map((m) => m.textContent)).toEqual(["Loops", "Loops"]);
  });
});
