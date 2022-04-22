/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { retryAsyncLoad } from "./chunk-util";

describe("retryAsyncLoad", () => {
  it("retry, fail", async () => {
    const waitTimes: number[] = [];
    const waiter = (waitTime: number) => {
      waitTimes.push(waitTime);
      return Promise.resolve();
    };
    await expect(() =>
      retryAsyncLoad(async () => {
        throw new Error("oops");
      }, waiter)
    ).rejects.toThrow("oops");
    expect(waitTimes).toEqual([250, 750, 2250, 6750]);
  });
  it("retry, pass", async () => {
    const waiter = () => Promise.resolve();
    let i = 0;
    expect(
      await retryAsyncLoad(async () => {
        if (i === 4) {
          return "yay";
        }
        i++;
        throw new Error("oops");
      }, waiter)
    ).toEqual("yay");
  });
});
