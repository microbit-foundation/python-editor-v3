import { AspectRatio, Box, Text } from "@chakra-ui/react";
import Spinner from "./Spinner";

export interface YoutubeVideo {
  alt: string;
  attribution: string;
  caption: string;
  youtubeId: String;
}

interface YoutubeVideoProps {
  youTubeVideo: YoutubeVideo | undefined;
}

const YoutubeVideoEmbed = ({ youTubeVideo }: YoutubeVideoProps) => {
  const { alt, attribution, caption, youtubeId } = youTubeVideo || {};
  return (
    <>
      {youTubeVideo ? (
        <Box as="figure">
          <AspectRatio ratio={16 / 9}>
            <iframe
              // Avoid youtube cookie. rel=0 should limit related videos to our channel.
              // Once we have translated videos we can try e.g. cc_lang_pref=fr
              // but we'll need to check our codes match theirs.
              title="welcome video"
              src={`https://www.youtube-nocookie.com/embed/${
                youtubeId ? encodeURIComponent(youtubeId.trim()) : ""
              }?rel=0&cc_load_policy=1`}
              allow="encrypted-media"
              frameBorder="0"
              allowFullScreen
            >
              <Text>{alt || ""}</Text>
            </iframe>
          </AspectRatio>
          {caption && (
            <Text as="figcaption" mt="5px" fontSize="sm">
              {caption}
            </Text>
          )}
          {attribution && (
            <Text as="figcaption" mt="5px" fontSize="sm">
              {attribution}
            </Text>
          )}
        </Box>
      ) : (
        <AspectRatio ratio={16 / 9}>
          <Spinner />
        </AspectRatio>
      )}
    </>
  );
};

export default YoutubeVideoEmbed;
