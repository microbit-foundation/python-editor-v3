/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { render, screen } from "@testing-library/react";
import { ClassifiedFileInput, FileOperation } from "./changes";
import ChooseMainScriptQuestion, {
  summarizeChange,
} from "./ChooseMainScriptQuestion";
import { MainScriptChoice } from "./project-actions";
import { stubIntl as intl } from "../messages/testing";
import FixedTranslationProvider from "../messages/FixedTranslationProvider";
import { InputValidationResult } from "../common/InputDialog";
import { MockedFunction, vi } from "vitest";

describe("ChooseMainScriptQuestion", () => {
  const data = () => Promise.resolve(new Uint8Array([0]));

  describe("component", () => {
    const setValue = vi.fn() as MockedFunction<
      (x: MainScriptChoice | undefined) => void
    >;
    const setValidationResult = vi.fn() as MockedFunction<
      (x: InputValidationResult) => void
    >;
    const currentFiles = new Set(["main.py", "magic.py"]);

    afterEach(() => {
      setValidationResult.mockClear();
      setValue.mockClear();
    });

    const renderComponent = (
      inputs: ClassifiedFileInput[],
      choice: string | undefined
    ) => {
      return render(
        <FixedTranslationProvider>
          <ChooseMainScriptQuestion
            validationResult={{ ok: true }}
            setValidationResult={setValidationResult}
            setValue={setValue}
            currentFiles={currentFiles}
            value={{ main: choice }}
            inputs={inputs}
            validate={() => ({ ok: true })}
          />
        </FixedTranslationProvider>
      );
    };

    it("main.py replacement", async () => {
      const inputs: ClassifiedFileInput[] = [
        {
          data,
          module: false,
          script: true,
          name: "main.py",
        },
      ];
      renderComponent(inputs, "samplefile.py");
      const items = (await screen.findAllByTestId("change")).map(
        (x) => x.textContent
      );

      expect(items).toEqual(["Replace main code with main.py"]);
      // We don't use a list for simple cases.
      expect(screen.queryAllByRole("listitem")).toEqual([]);
    });

    it("two options for main.py case", async () => {
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
      const findAllListItems = async () =>
        Array.from((await result.findAllByRole("list"))[0].childNodes).map(
          (x) => x.firstChild!.firstChild!.firstChild?.textContent
        );
      expect(await findAllListItems()).toEqual([
        "Replace main code with a.py",
        "Add file b.py",
      ]);
    });
  });

  describe("summarizeChange", () => {
    it("most common scenario is special cased to refer to main code", () => {
      expect(
        summarizeChange(intl, {
          operation: FileOperation.REPLACE,
          module: false,
          script: true,
          data,
          source: "somefile.py",
          target: "main.py",
        })
      ).toEqual("choose-main-source-replace-main-code");
    });

    it("names modules as such", () => {
      expect(
        summarizeChange(intl, {
          operation: FileOperation.ADD,
          module: true,
          script: false,
          data,
          source: "module.py",
          target: "module.py",
        })
      ).toEqual("choose-main-add-module");
    });

    it("non-main non-module replace", () => {
      expect(
        summarizeChange(intl, {
          operation: FileOperation.REPLACE,
          module: false,
          script: false,
          data,
          source: "dave.py",
          target: "dave.py",
        })
      ).toEqual("choose-main-replace-file");
    });

    it("non-python add", () => {
      expect(
        summarizeChange(intl, {
          operation: FileOperation.ADD,
          module: false,
          script: false,
          data,
          source: "data.dat",
          target: "data.dat",
        })
      ).toEqual("choose-main-add-file");
    });
  });
});
