export const baseUrl = (() => {
  let base = import.meta.env.BASE_URL || "/";
  if (!base.endsWith("/")) {
    base += "/";
  }
  return base;
})();
