/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { render } from "@testing-library/react";
import ScrollablePanel from "../../common/ScrollablePanel";
import { ActiveEditorProvider } from "../../editor/active-editor-hooks";
import { ApiDocsEntry } from "../../language-server/apidocs";
import NullLoggingProvider from "../../logging/NullLoggingProvider";
import FixedTranslationProvider from "../../messages/FixedTranslationProvider";
import SessionSettingsProvider from "../../settings/session-settings";
import ApiNode, { getDragContext } from "./ApiNode";

describe("ApiNode", () => {
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

  it("renders", async () => {
    render(
      <FixedTranslationProvider>
        <NullLoggingProvider>
          <SessionSettingsProvider>
            <ActiveEditorProvider>
              <ScrollablePanel>
                <ApiNode docs={node} />
              </ScrollablePanel>
            </ActiveEditorProvider>
          </SessionSettingsProvider>
        </NullLoggingProvider>
      </FixedTranslationProvider>
    );
  });
});

describe("getDragContext", () => {
  it("creates the correct dragContext with a micro:bit function", () => {
    const context = getDragContext("microbit.display.clear", "function");
    expect(context.type).toEqual("call");
    expect(context.code).toEqual("from microbit import *\ndisplay.clear()");
  });

  it("creates the correct dragContext with an alternative function", () => {
    const context = getDragContext("machine.reset", "function");
    expect(context.type).toEqual("call");
    expect(context.code).toEqual("import machine\nmachine.reset()");
  });

  it("creates the correct dragContext with a micro:bit variable", () => {
    const context = getDragContext("microbit.Sound.GIGGLE", "variable");
    expect(context.type).toEqual("example");
    expect(context.code).toEqual("from microbit import *\nSound.GIGGLE");

    const altContext = getDragContext("microbit.Image.HEART", "variable");
    expect(altContext.type).toEqual("example");
    expect(altContext.code).toEqual("from microbit import *\nImage.HEART");
  });

  it("creates the correct dragContext with an alternative variable", () => {
    const context = getDragContext("log.MILLISECONDS", "variable");
    expect(context.type).toEqual("example");
    expect(context.code).toEqual("import log\nlog.MILLISECONDS");
  });

  it("creates the correct dragContext with a micro:bit class", () => {
    const context = getDragContext("microbit.MicroBitTouchPin", "class");
    expect(context.type).toEqual("example");
    expect(context.code).toEqual(`from microbit import *\npin0`);
  });

  it("creates the correct dragContext for os.uname", () => {
    const context = getDragContext("os.uname_result.version", "variable");
    expect(context.type).toEqual("example");
    expect(context.code).toEqual(`import os\nos.uname().version`);
  });

  it("creates the correct dragContext with __init__", () => {
    const context = getDragContext("neopixel.NeoPixel.__init__", "function");
    expect(context.type).toEqual("call");
    expect(context.code).toEqual("import neopixel\nneopixel.NeoPixel()");
  });
});
