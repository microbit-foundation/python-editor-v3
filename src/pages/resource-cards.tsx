/**
 * The cards linking to microbit.org and the support site from the home page.
 *
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { IntlShape } from "react-intl";
import accessibilityImage from "theme-package/images/accessibility.svg";
import firstLessonsImage from "theme-package/images/first-lessons-python.svg";
import ideaPlaceholder from "theme-package/images/idea-placeholder.png";
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
import { createEditorUrl } from "../urls";
import ResourceCard from "./ResourceCard";

interface Idea {
  titleId: string;
  /** The idea's slug in the editor's ideas tab. */
  slug: string;
}

const ideas: Idea[] = [
  { titleId: "idea-emotion-badge-title", slug: "emotion-badge" },
  { titleId: "idea-step-counter-title", slug: "step-counter" },
  { titleId: "idea-activity-picker-title", slug: "activity-picker" },
  { titleId: "idea-send-a-smile-title", slug: "send-a-smile" },
  { titleId: "idea-dice-title", slug: "dice" },
  { titleId: "idea-clap-lights-title", slug: "clap-lights" },
  { titleId: "idea-frere-jacques-title", slug: "frère-jacques" },
];

// Placeholder artwork until the idea images are decided.
export const createIdeaCards = (intl: IntlShape) =>
  ideas.map((idea) => (
    <ResourceCard
      key={idea.titleId}
      title={intl.formatMessage({ id: idea.titleId })}
      to={createEditorUrl({ tab: "ideas", slug: { id: idea.slug } })}
      imgSrc={ideaPlaceholder}
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
    imageFit="contain"
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
        imageFit="contain"
      />
    ));
