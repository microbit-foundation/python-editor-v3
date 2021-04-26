import { FileOperation } from "./changes";
import { summarizeChange } from "./ChooseMainScriptQuestion";

describe("ChooseMainScriptQuestion", () => {
  describe("summarizeChange", () => {
    const data = () => Promise.resolve(new Uint8Array([0]));
    it("most common scenario is special cased to refer to main code", () => {
      expect(
        summarizeChange({
          operation: FileOperation.REPLACE,
          module: false,
          script: true,
          data,
          source: "somefile.py",
          target: "main.py",
        })
      ).toEqual("Replace main code with somefile.py");
    });

    it("names modules as such", () => {
      expect(
        summarizeChange({
          operation: FileOperation.ADD,
          module: true,
          script: false,
          data,
          source: "module.py",
          target: "module.py",
        })
      ).toEqual("Add module module.py");
    });

    it("non-main non-module replace", () => {
      expect(
        summarizeChange({
          operation: FileOperation.REPLACE,
          module: false,
          script: false,
          data,
          source: "dave.py",
          target: "dave.py",
        })
      ).toEqual("Replace file dave.py");
    });

    it("non-python add", () => {
      expect(
        summarizeChange({
          operation: FileOperation.ADD,
          module: false,
          script: false,
          data,
          source: "data.dat",
          target: "data.dat",
        })
      ).toEqual("Add file data.dat");
    });
  });
});
