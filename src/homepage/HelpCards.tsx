/**
 * (c) 2024, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { IntlShape } from "react-intl";
import {
  accessibilityUrl,
  supportSiteFolderUrl,
  userGuideUrl,
} from "./external-links";
import helpImage1 from "theme-package/images/user-guide.svg";
import helpImage2 from "theme-package/images/troubleshooting.svg";
import helpImage3 from "theme-package/images/accessibility.svg";
import ResourceCard from "./ResourceCard";

interface HelpConfig {
  titleId: string;
  url: string;
  imgSrc: string;
  imagePadding?: number;
  aspectRatio?: number;
}

const helpConfig: HelpConfig[] = [
  {
    titleId: "user-guide",
    url: userGuideUrl(),
    imgSrc: helpImage1,
  },
  {
    titleId: "troubleshooting-resource-title",
    url: supportSiteFolderUrl(),
    imgSrc: helpImage2,
  },
  {
    titleId: "accessibility-resource-title",
    url: accessibilityUrl(),
    imgSrc: helpImage3,
  },
];

export const createHelpCards = (intl: IntlShape) =>
  helpConfig.map((help) => (
    <ResourceCard
      key={help.titleId}
      title={intl.formatMessage({
        id: help.titleId,
      })}
      url={help.url}
      imgSrc={help.imgSrc}
      imagePadding={help.imagePadding}
      aspectRatio={help.aspectRatio}
    />
  ));
