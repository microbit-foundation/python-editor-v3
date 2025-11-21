
export interface ProjectEntry {
  projectName: string;
  id: string;
  modifiedDate: number;
  parentRevision?: string;
}

export type ProjectList = ProjectEntry[];

type ProjectDbWrapper = <T>(
  accessMode: "readonly" | "readwrite",
  callback: (projects: IDBObjectStore) => Promise<T>
) => Promise<T>;

export const withProjectDb: ProjectDbWrapper = async (accessMode, callback) => {
  return new Promise((res, rej) => {
    // TODO: what if multiple users? I think MakeCode just keeps everything...
    const openRequest = indexedDB.open("UserProjects", 2);
    openRequest.onupgradeneeded = (evt: IDBVersionChangeEvent) => {
      const db = openRequest.result;
      // NB: a more robust way to write migrations would be to get the current stored
      // db.version and open it repeatedly with an ascending version number until the
      // db is up to date. That would be more boilerplate though.
      const tx = (evt.target as IDBOpenDBRequest).transaction;
      // if the data object store doesn't exist, create it

      let projects: IDBObjectStore;
      if (!db.objectStoreNames.contains("projects")) {
        projects = db.createObjectStore("projects", { keyPath: "id" });
        // no indexes at present, get the whole db each time
      } else {
        projects = tx!.objectStore("projects");
      }
      if (!projects.indexNames.contains("modifiedDate")) {
        projects.createIndex("modifiedDate", "modifiedDate");
        const now = new Date().valueOf();
        const updateProjectData = projects.getAll();
        updateProjectData.onsuccess = () => {
          updateProjectData.result.forEach((project) => {
            if (!('modifiedDate' in project)) {
              projects.put({ ...project, modifiedDate: now });
            }
          });
        };
      }
    };

    openRequest.onsuccess = async () => {
      const db = openRequest.result;

      const tx = db.transaction("projects", accessMode);
      const store = tx.objectStore("projects");
      tx.onabort = rej;
      tx.onerror = rej;

      const result = await callback(store);

      // got the result, but don't return until the transaction is complete
      tx.oncomplete = () => res(result);
    };

    openRequest.onerror = rej;
  });
};


export const modifyProject = async (id: string, extras?: Partial<ProjectEntry>) => {
  await withProjectDb("readwrite", async (store) => {
    await new Promise((res, _rej) => {
      const getQuery = store.get(id);
      getQuery.onsuccess = () => {
        const putQuery = store.put({
          ...getQuery.result,
          ...extras,
          modifiedDate: new Date().valueOf(),
        });
        putQuery.onsuccess = () => res(getQuery.result);
      };
    });
  });
}
