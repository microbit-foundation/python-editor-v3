import React, { ReactNode } from "react";

interface SeparateProps {
  children: ReactNode;
  separator: ReactNode;
}

const Separate = ({ children, separator }: SeparateProps): ReactNode[] => {
  const result: ReactNode[] = [];
  const count = React.Children.count(children);
  React.Children.forEach(children, (n, i) => {
    result.push(n);
    if (i < count - 1) {
      result.push(separator);
    }
  });
  return result;
};

export default Separate;
