/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Image } from "@microbit/ui";
import { ComponentProps, ReactElement, useState } from "react";

interface ImageWithFallbackProps extends ComponentProps<typeof Image> {
  /** Shown while loading and on error (Chakra Image's `fallback`). */
  fallback?: ReactElement;
  /** Skip the fallback entirely (Chakra Image's `ignoreFallback`). */
  ignoreFallback?: boolean;
}

/**
 * The library Image plus Chakra Image's fallback behaviour, for the offline
 * placeholders used by the documentation areas.
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
