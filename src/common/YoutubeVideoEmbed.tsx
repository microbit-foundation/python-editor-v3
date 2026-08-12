/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { styled } from "styled-system/jsx";

export interface YoutubeVideo {
  alt: string;
  youtubeId: string;
}

interface YoutubeVideoProps {
  alt: string;
  youtubeId: string;
}

const YoutubeVideoEmbed = ({ alt, youtubeId }: YoutubeVideoProps) => {
  return (
    <figure>
      <styled.iframe
        aspectRatio="16 / 9"
        width="100%"
        // Avoid youtube cookie. rel=0 should limit related videos to our channel.
        // Once we have translated videos we can try e.g. cc_lang_pref=fr
        // but we'll need to check our codes match theirs.
        title={alt}
        src={`https://www.youtube-nocookie.com/embed/${
          youtubeId ? encodeURIComponent(youtubeId.trim()) : ""
        }?rel=0&cc_load_policy=1`}
        allow="encrypted-media"
        frameBorder="0"
        allowFullScreen
      />
    </figure>
  );
};

export default YoutubeVideoEmbed;
