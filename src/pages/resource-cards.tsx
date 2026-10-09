/**
 * The cards linking to microbit.org and the support site from the home page.
 *
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { IntlShape } from "react-intl";
import accessibilityImage from "theme-package/images/accessibility.svg";
import animatedAnimals from "theme-package/images/animated-animals.jpg";
import beatingHeart from "theme-package/images/beating-heart.jpg";
import emotionBadge from "theme-package/images/emotion-badge.png";
import firstLessonsImage from "theme-package/images/first-lessons-python.svg";
import flashingEmotions from "theme-package/images/flashing-emotions.jpg";
import getSilly from "theme-package/images/get-silly.png";
import heart from "theme-package/images/heart.png";
import hotPotatoGame from "theme-package/images/hot-potato-game.jpg";
import indoorOutdoorThermometer from "theme-package/images/indoor-outdoor-thermometer.png";
import maxminTemperatureLogger from "theme-package/images/maxmin-temperature-logger.png";
import sensitiveStepCounter from "theme-package/images/sensitive-step-counter.jpg";
import teleportingDuck from "theme-package/images/teleporting-duck.jpg";
import thermometer from "theme-package/images/thermometer.png";
import treasureHunt from "theme-package/images/treasure-hunt.png";
import troubleshootingImage from "theme-package/images/troubleshooting.svg";
import userGuideImage from "theme-package/images/user-guide.svg";
import { BrandConfig } from "../deployment";
import { microbitOrgLessonUrl, microbitOrgProjectUrl } from "../external-links";
import ResourceCard from "./ResourceCard";

interface ProjectIdea {
  titleId: string;
  /** The "make it: code it" project's slug on microbit.org. */
  slug: string;
  imgSrc: string;
}

const projectIdeas: ProjectIdea[] = [
  { titleId: "project-idea-heart-title", slug: "heart", imgSrc: heart },
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
  projectIdeas.map((idea) => (
    <ResourceCard
      key={idea.titleId}
      title={intl.formatMessage({ id: idea.titleId })}
      url={microbitOrgProjectUrl(idea.slug, languageId)}
      imgSrc={idea.imgSrc}
    />
  ));

interface MiciProject {
  titleId: string;
  /** The "make it: code it" project's slug on microbit.org. */
  slug: string;
  imgSrc: string;
}

const miciProjects: MiciProject[] = [
  {
    titleId: "mici-project-thermometer-title",
    slug: "thermometer",
    imgSrc: thermometer,
  },
  {
    titleId: "mici-project-sensitive-step-counter-title",
    slug: "sensitive-step-counter",
    imgSrc: sensitiveStepCounter,
  },
  {
    titleId: "mici-project-treasure-hunt-title",
    slug: "treasure-hunt",
    imgSrc: treasureHunt,
  },
  {
    titleId: "mici-project-maxmin-temperature-logger-title",
    slug: "maxmin-temperature-logger",
    imgSrc: maxminTemperatureLogger,
  },
  {
    titleId: "mici-project-indoor-outdoor-thermometer-title",
    slug: "indoor-outdoor-thermometer",
    imgSrc: indoorOutdoorThermometer,
  },
  {
    titleId: "mici-project-teleporting-duck-title",
    slug: "teleporting-duck",
    imgSrc: teleportingDuck,
  },
  {
    titleId: "mici-project-hot-potato-game-title",
    slug: "hot-potato-game",
    imgSrc: hotPotatoGame,
  },
];

export const createMiciProjectCards = (intl: IntlShape, languageId: string) =>
  miciProjects.map((project) => (
    <ResourceCard
      key={project.titleId}
      title={intl.formatMessage({ id: project.titleId })}
      url={microbitOrgProjectUrl(project.slug, languageId)}
      imgSrc={project.imgSrc}
    />
  ));

export const createLessonCards = (intl: IntlShape) => [
  <ResourceCard
    key="first-lessons"
    title={intl.formatMessage({
      id: "first-lessons-with-python-resource-title",
    })}
    url={microbitOrgLessonUrl("first-lessons-with-python-and-the-microbit")}
    imgSrc={firstLessonsImage}
    imagePadding={5}
  />,
];

type HelpLinks = Pick<
  BrandConfig,
  "userGuideLink" | "supportLink" | "accessibilityLink"
>;

/**
 * Help cards for the links the brand supplies; a deployment without one
 * has no card for it.
 */
export const createHelpCards = (
  intl: IntlShape,
  { userGuideLink, supportLink, accessibilityLink }: HelpLinks
) =>
  [
    { titleId: "user-guide", url: userGuideLink, imgSrc: userGuideImage },
    {
      titleId: "troubleshooting-resource-title",
      url: supportLink,
      imgSrc: troubleshootingImage,
    },
    {
      titleId: "accessibility-resource-title",
      url: accessibilityLink,
      imgSrc: accessibilityImage,
    },
  ]
    .filter((help): help is typeof help & { url: string } => !!help.url)
    .map((help) => (
      <ResourceCard
        key={help.titleId}
        title={intl.formatMessage({ id: help.titleId })}
        url={help.url}
        imgSrc={help.imgSrc}
      />
    ));
