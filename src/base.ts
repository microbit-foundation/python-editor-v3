export const baseUrl = (() => {
  let base = import.meta.env.PUBLIC_URL || "/";
  if (!base.endsWith("/")) {
    base += "/";
  }
  return base;
})();
