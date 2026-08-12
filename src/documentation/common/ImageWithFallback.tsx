/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Image } from "@microbit/ui";
import { ComponentProps, ReactElement, useState } from "react";

interface ImageWithFallbackProps extends ComponentProps<typeof Image> {
  /** Shown while loading and on error. */
  fallback?: ReactElement;
  /** Skip the fallback entirely. */
  ignoreFallback?: boolean;
}

/**
 * The library Image plus fallback behaviour, for the offline placeholders
 * used by the documentation areas.
 */
const ImageWithFallback = ({
  fallback,
  ignoreFallback,
  ...props
}: ImageWithFallbackProps) => {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading"
  );
  if (ignoreFallback || !fallback) {
    return <Image {...props} />;
  }
  return (
    <>
      {status !== "loaded" && fallback}
      {status !== "error" && (
        <Image
          {...props}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          style={
            status === "loaded"
              ? props.style
              : { ...props.style, display: "none" }
          }
        />
      )}
    </>
  );
};

export default ImageWithFallback;
