import { useEffect, useState } from "react";

const check = () => document.readyState !== "loading";

const useDocumentInteractive = (): boolean => {
  const [state, setState] = useState(check());
  useEffect(() => {
    const listener = () => {
      setState(check());
    };
    listener();
    document.addEventListener("readystatechange", listener);
    return () => {
      document.removeEventListener("readystatechange", listener);
    };
  }, []);
  return state;
};

export default useDocumentInteractive;
