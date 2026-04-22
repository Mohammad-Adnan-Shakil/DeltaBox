import { useEffect } from "react";

const usePageTitle = (title) => {
  useEffect(() => {
    document.title = `${title} | DeltaBox`;
  }, [title]);
};

export default usePageTitle;

