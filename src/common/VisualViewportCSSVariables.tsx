import { useEffect } from "react";

const styleId = "vvp-style";

/**
 * Maintains CSS variables for the visual viewport width and height.
 * Use with fallbacks, e.g. var(--vvh100, 100vh)
 * https://developer.mozilla.org/en-US/docs/Web/API/Visual_Viewport_API
 *
 * This is important for iOS where we want to avoid the keyboard being
 * drawn over the toolbar at the bottom.
 */
const VisualViewPortCSSVariables = () => {
  useEffect(() => {
    const resizeHandler = () => {
      const { width, height } = window.visualViewport;
      let style = document.getElementById(styleId);
      if (!style) {
        style = document.head.appendChild(document.createElement("style"));
        style.id = styleId;
      }
      style.innerText = `:root { --vvw: ${width}px; --vvh: ${height}px; }`;
    };
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", resizeHandler);
      resizeHandler();
    }
    return () => {
      window.visualViewport.removeEventListener("resize", resizeHandler);
      const style = document.getElementById(styleId);
      if (style) {
        style.remove();
      }
    };
  }, []);
  return null;
};

export default VisualViewPortCSSVariables;
