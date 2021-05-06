class TimeoutError extends Error {}

/**
 * Utility to time out an action after a delay.
 *
 * The action cannot be cancelled; it may still proceed after the timeout.
 */
export async function withTimeout<T>(
  action: Promise<T>,
  timeout: number
): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new TimeoutError());
    }, timeout);
  });
  const actionPromise = action.then((v) => {
    clearTimeout(timeoutHandle);
    return v;
  });
  // timeoutPromise never resolves so result must be from action
  return Promise.race([actionPromise, timeoutPromise]) as Promise<T>;
}
