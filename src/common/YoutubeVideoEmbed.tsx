import { AspectRatio, Box } from "@chakra-ui/react";

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
    <Box as="figure">
      <AspectRatio ratio={16 / 9}>
        <iframe
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
      </AspectRatio>
    </Box>
  );
};

export default YoutubeVideoEmbed;
