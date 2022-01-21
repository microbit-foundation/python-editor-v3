import { contextExtracts } from "./extracts";

describe("contextExtracts", () => {
  it("gives leading trailing", () => {
    expect(contextExtracts([[10, 5]], "0123456789match0123456789", 3)).toEqual([
      { type: "text", extract: "…789" },
      { type: "match", extract: "match" },
      { type: "text", extract: "012…" },
    ]);
  });
  it("gives trailing no leading", () => {
    expect(contextExtracts([[0, 5]], "match0123456789", 3)).toEqual([
      { type: "match", extract: "match" },
      { type: "text", extract: "012…" },
    ]);
  });
  it("gives leading no trailing", () => {
    expect(contextExtracts([[10, 5]], "0123456789match", 3)).toEqual([
      { type: "text", extract: "…789" },
      { type: "match", extract: "match" },
    ]);
  });
  it("match only", () => {
    expect(contextExtracts([[0, 5]], "match", 3)).toEqual([
      { type: "match", extract: "match" },
    ]);
  });
  it("splits text between matches", () => {
    expect(
      contextExtracts(
        [
          [0, 6],
          [16, 6],
        ],
        "match10123456789match2",
        3
      )
    ).toEqual([
      { type: "match", extract: "match1" },
      { type: "text", extract: "012…" },
      { type: "text", extract: "…789" },
      { type: "match", extract: "match2" },
    ]);
  });
  it("doesn't split text between matches when pointless", () => {
    expect(
      contextExtracts(
        [
          [0, 6],
          [12, 6],
        ],
        "match1012345match2",
        3
      )
    ).toEqual([
      { type: "match", extract: "match1" },
      // Ensure no pointless "…"
      { type: "text", extract: "012345" },
      { type: "match", extract: "match2" },
    ]);
  });
});
