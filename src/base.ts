export const baseUrl = (() => {
  let base = process.env.PUBLIC_URL || "/";
  if (!base.endsWith("/")) {
    base += "/";
  }
  return base;
})();
