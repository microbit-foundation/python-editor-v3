import { validateNewFilename } from "./project-utils";

describe("validateNewFilename", () => {
  const exists = (filename: string) => filename === "main.py";

  it("errors for Python extensions", () => {
    expect(validateNewFilename("foo.py", exists)).toEqual(
      "Python files should have lowercase names with no spaces"
    );
  });
  it("errors for spaces", () => {
    expect(validateNewFilename("spaces are not allowed", exists)).toEqual(
      "Python files should have lowercase names with no spaces"
    );
  });
  it("errors for uppercase", () => {
    expect(validateNewFilename("OHNO", exists)).toEqual(
      "Python files should have lowercase names with no spaces"
    );
  });
  it("errors for file clashes", () => {
    expect(validateNewFilename("main", exists)).toEqual(
      "This file already exists"
    );
  });
  it("accepts valid names", () => {
    expect(
      validateNewFilename("underscores_are_allowed", exists)
    ).toBeUndefined();
  });
});
