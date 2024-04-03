/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useEffect } from "react";

const styleId = "vvp-style";

/**
 * Maintains CSS variables for the visual viewport width and height.
 * Use with fallbacks, e.g. var(--ios-vvh, 100vh)
 * https://developer.mozilla.org/en-US/docs/Web/API/Visual_Viewport_API
 *
 * We skip it on other platforms and rely on the fallback.
 */
const VisualViewPortCSSVariables = () => {
  useEffect(() => {
    // If we remove the iOS check then we should look carefully at resize performance.
    if (!window.visualViewport) {
      return;
    }
    const resizeHandler = () => {
      const { width, height } = window.visualViewport ?? {};
      let style = document.getElementById(styleId);
      if (!style) {
        style = document.head.appendChild(document.createElement("style"));
        style.id = styleId;
      }
      style.innerText = `:root { --ios-vvw: ${width}px; --ios-vvh: ${height}px; }`;
    };
    window.visualViewport.addEventListener("resize", resizeHandler);
    resizeHandler();
    return () => {
      window.visualViewport?.removeEventListener("resize", resizeHandler);
      const style = document.getElementById(styleId);
      if (style) {
        style.remove();
      }
    };
  }, []);
  return null;
};

export default VisualViewPortCSSVariables;
