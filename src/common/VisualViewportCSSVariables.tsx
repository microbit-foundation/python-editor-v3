/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useEffect } from "react";

const styleId = "vvp-style";

const isIOS = (): boolean =>
  /iPad|iPhone|iPod/.test(navigator.platform) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

/**
 * Maintains CSS variables for the visual viewport width and height.
 * Use with fallbacks, e.g. var(--vvh, 100vh)
 * https://developer.mozilla.org/en-US/docs/Web/API/Visual_Viewport_API
 */
const VisualViewPortCSSVariables = () => {
  const addStyleInnerText = (innerText: string) => {
    let style = document.getElementById(styleId);
    if (!style) {
      style = document.head.appendChild(document.createElement("style"));
      style.id = styleId;
    }
    style.innerText = innerText;
  };

  useEffect(() => {
    // svh on Safari in iOS does not resize when virtual keyboard is present
    if (CSS.supports("height: 100svh") && !isIOS) {
      addStyleInnerText(":root { --vvh: 100svh }");
      return;
    }
    if (!window.visualViewport) {
      return;
    }
    const resizeHandler = () => {
      const { width, height } = window.visualViewport ?? {};
      addStyleInnerText(`:root { --vvw: ${width}px; --vvh: ${height}px; }`);
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
