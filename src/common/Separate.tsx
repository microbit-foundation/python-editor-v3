/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import React, { ReactNode } from "react";

export const br = (key: React.Key) => <br key={key} />;

interface SeparateProps {
  children: ReactNode;
  separator: (key: React.Key) => ReactNode;
}

/**
 * Separates children
 */
const Separate = ({ children, separator }: SeparateProps) => {
  const result: ReactNode[] = [];
  const count = React.Children.count(children);
  React.Children.forEach(children, (n, i) => {
    result.push(n);
    if (i < count - 1) {
      result.push(separator(i));
    }
  });
  return <>{result}</>;
};

export default Separate;
