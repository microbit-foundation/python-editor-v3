import { toCsv } from "./DataLoggingModule";

describe("toCsv", () => {
  it("works for a basic case", () => {
    expect(
      toCsv({
        headings: ["A", "B"],
        data: [{ data: ["1", "2"] }, { data: ["3", "4"] }],
      })
    ).toEqual("A,B\r\n1,2\r\n3,4");
  });
  it("escapes content", () => {
    expect(
      toCsv({
        headings: ['"A\n', "B"],
        data: [{ data: ["1", "\r2,"] }, { data: ["3", "4"] }],
      })
    ).toEqual(`"""A\n",B\r\n1,"\r2,"\r\n3,4`);
  });
});
