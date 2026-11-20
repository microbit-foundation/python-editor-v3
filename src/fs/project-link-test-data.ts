import { ProjectLink } from "./project-link";

// The heart project.
export const testProjectLinkUrl =
  // origin needs to match jest's testUrl
  "http://localhost:3000/#import:#project:XQAAgACRAAAAAAAAAAA9iImmlGSt1R++5LD+ZJ36cRz46B+lhYtNRoWF0nijpaVyZlK7ACfSpeoQpgfk21st4ty06R4PEOM4sSAXBT95G3en+tghrYmE+YJp6EiYgzA9ThKkyShWq2UdvmCzqxoNfYc1wlmTqlNv/Piaz3WoSe3flvr/ItyLl0aolQlEpv4LA8A=";

/** What testProjectLinkUrl carries, less the fields we don't use. */
export const testProjectLink: ProjectLink = {
  meta: { name: "Hearts" },
  source: `from microbit import *\r\ndisplay.show(Image.HEART)`,
};
