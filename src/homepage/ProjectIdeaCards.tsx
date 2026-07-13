/**
 * (c) 2024-2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { IntlShape } from "react-intl";
import { projectUrl } from "./external-links";
import animatedAnimals from "theme-package/images/animated-animals.gif";
import beatingHeart from "theme-package/images/beating-heart.gif";
import emotionBadge from "theme-package/images/emotion-badge.png";
import flashingEmotions from "theme-package/images/flashing-emotions.gif";
import getSilly from "theme-package/images/get-silly.png";
import heart from "theme-package/images/heart.png";
import ResourceCard from "./ResourceCard";

interface ProjectIdeaConfig {
  titleId: string;
  // "make it, code it" project slug.
  slug: string;
  imgSrc: string;
}

const projectIdeas: ProjectIdeaConfig[] = [
  {
    titleId: "project-idea-heart-title",
    slug: "heart",
    imgSrc: heart,
  },
  {
    titleId: "project-idea-beating-heart-title",
    slug: "beating-heart",
    imgSrc: beatingHeart,
  },
  {
    titleId: "project-idea-animated-animals-title",
    slug: "animated-animals",
    imgSrc: animatedAnimals,
  },
  {
    titleId: "project-idea-emotion-badge-title",
    slug: "emotion-badge",
    imgSrc: emotionBadge,
  },
  {
    titleId: "project-idea-get-silly-title",
    slug: "get-silly",
    imgSrc: getSilly,
  },
  {
    titleId: "project-idea-flashing-emotions-title",
    slug: "flashing-emotions",
    imgSrc: flashingEmotions,
  },
];

export const createProjectIdeaCards = (intl: IntlShape, languageId: string) =>
  projectIdeas.map((project) => (
    <ResourceCard
      key={project.titleId}
      title={intl.formatMessage({ id: project.titleId })}
      url={`${projectUrl(project.slug, languageId)}?editor=python`}
      imgSrc={project.imgSrc}
    />
  ));
