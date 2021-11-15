import { Toolkit } from "./model";

const toolkitQueryUrl =
  // For now we just slurp everything at once.
  // Might revisit depending on eventual size.
  "https://ajwvhvgo.api.sanity.io/v1/data/query/apps?query=*%5B_type%20%3D%3D%20%22toolkit%22%5D%7Bid%2C%20name%2C%20description%2C%20contents%5B%5D-%3E%7Bname%2C%20subtitle%2C%20introduction%2C%20contents%5B%5D-%3E%7Bname%2C%20content%2C%20alternatives%2C%20detailContent%7D%7D%7D";

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
