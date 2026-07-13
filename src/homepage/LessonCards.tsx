/**
 * (c) 2024, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 *
 * NOTE: placeholder content/URLs carried over from CreateAI for the prototype.
 */
import { IntlShape } from "react-intl";
import { lessonUrl } from "./external-links";
import lessonImage1 from "theme-package/images/first-lessons-python.svg";
import ResourceCard from "./ResourceCard";

interface LessonConfig {
  titleId: string;
  url: string;
  imgSrc: string;
}

const lessons: LessonConfig[] = [
  {
    titleId: "first-lessons-with-python-resource-title",
    url: "first-lessons-with-python-and-the-microbit",
    imgSrc: lessonImage1,
  },
];

export const createLessonCards = (intl: IntlShape) =>
  lessons.map((lesson) => (
    <ResourceCard
      key={lesson.titleId}
      title={intl.formatMessage({
        id: lesson.titleId,
      })}
      url={lessonUrl(lesson.url)}
      imgSrc={lesson.imgSrc}
      imagePadding={5}
    />
  ));
