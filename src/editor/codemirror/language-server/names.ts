export const removeFullyQualifiedName = (fn: string): string => {
  const bracket = fn.indexOf("(");
  const before = fn.substring(0, bracket);
  const remainder = fn.substring(bracket);

  const parts = before.split(".");
  const name = parts[parts.length - 1];
  return name + remainder;
};
