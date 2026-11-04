/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ToastFn } from "@microbit/ui";
import { createIntl } from "react-intl";
import { vi } from "vitest";
import { MockLogging } from "../logging/mock";
import messages from "../messages/ui.en.json";
import { ActionFeedback } from "./use-action-feedback";

describe("ActionFeedback", () => {
  it("uses a distinct title for unexpected errors", () => {
    const intl = createIntl({ locale: "en", messages });
    const toast = Object.assign(vi.fn(), { closeAll: vi.fn() });
    const logging = new MockLogging();
    const feedback = new ActionFeedback(
      toast as unknown as ToastFn,
      logging,
      intl
    );

    feedback.unexpectedError(new Error("Boom"));

    expect(toast).toHaveBeenCalledOnce();
    expect(toast.mock.calls[0][0]).toMatchObject({
      title: "An unexpected error occurred",
      status: "error",
    });
    expect(logging.errors).toHaveLength(1);
  });
});
