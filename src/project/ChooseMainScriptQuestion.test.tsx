import { render } from "@testing-library/react";
import { ClassifiedFileInput, FileOperation } from "./changes";
import ChooseMainScriptQuestion, {
  summarizeChange,
} from "./ChooseMainScriptQuestion";
import { MainScriptChoice } from "./project-actions";

describe("ChooseMainScriptQuestion", () => {
  const data = () => Promise.resolve(new Uint8Array([0]));

  describe("component", () => {
    const setValue = jest.fn() as jest.MockedFunction<
      (x: MainScriptChoice | undefined) => void
    >;
    const setError = jest.fn() as jest.MockedFunction<
      (x: string | undefined) => void
    >;
    const currentFiles = new Set(["main.py", "magic.py"]);

    afterEach(() => {
      setError.mockClear();
      setValue.mockClear();
    });

    const renderComponent = (
      inputs: ClassifiedFileInput[],
      choice: string | undefined
    ) => {
      return render(
        <ChooseMainScriptQuestion
          error={undefined}
          setError={setError}
          setValue={setValue}
          currentFiles={currentFiles}
          value={{ main: choice }}
          inputs={inputs}
          validate={() => undefined}
        />
      );
    };

    it("main.py replacement", () => {
      const inputs: ClassifiedFileInput[] = [
        {
          data,
          module: false,
          script: true,
          name: "main.py",
        },
      ];
      const result = renderComponent(inputs, "samplefile.py");
      const items = result.getAllByTestId("change").map((x) => x.textContent);

      expect(items).toEqual(["Replace main code with main.py"]);
      // We don't use a list for simple cases.
      expect(result.queryAllByRole("listitem")).toEqual([]);
    });

    it("two options for main.py case", () => {
      const inputs: ClassifiedFileInput[] = [
        {
          data,
          module: false,
          script: true,
          name: "a.py",
        },
        {
          data,
          module: false,
          script: true,
          name: "b.py",
        },
      ];
      const result = renderComponent(inputs, "a.py");
      const getAllListItems = () =>
        Array.from(result.getAllByRole("list")[0].childNodes).map(
          (x) => x.firstChild!.firstChild!.firstChild?.textContent
        );
      expect(getAllListItems()).toEqual([
        "Replace main code with a.py",
        "Add file b.py",
      ]);
    });
  });

  describe("summarizeChange", () => {
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
