import { Toolkit } from "./model";

// For now we just slurp everything at once.
// Might revisit depending on eventual size.
const toolkitQuery = `
  *[_type == "toolkit" && !(_id in path("drafts.**"))]{
    id, name, description, 
    contents[]->{
      name, subtitle, introduction, 
      contents[]->{
        name, content, alternativesLabel, alternatives, detailContent
      }
    }
  }`;
// No need to add a Sanity client dependency just for this.
const toolkitQueryUrl =
  "https://ajwvhvgo.api.sanity.io/v1/data/query/apps?query=" +
  encodeURIComponent(toolkitQuery);

const fetchToolkitsInternal = async (): Promise<Toolkit[]> => {
  const response = await fetch(toolkitQueryUrl);
  if (response.ok) {
    const { result } = await response.json();
    if (!result) {
      throw new Error("Unexpected response format");
    }
    return result as Toolkit[];
  }
  throw new Error("Error fetching toolkit content: " + response.status);
};

let promise: Promise<Toolkit[]> | undefined;

const fetchToolkits = async (): Promise<Toolkit[]> => {
  if (!promise) {
    promise = fetchToolkitsInternal();
  }
  return await promise;
};

export const fetchToolkit = async (id: string) => {
  const toolkits = await fetchToolkits();
  const toolkit = toolkits.find((t) => id === t.id);
  if (!toolkit) {
    throw new Error(`No toolkit with id ${id}`);
  }
  return toolkit;
};
