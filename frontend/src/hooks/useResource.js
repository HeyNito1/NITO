import { useEffect, useState } from "react";
export function useResource(loader) {
  const [state, setState] = useState({
    data: null,
    status: "loading",
    error: null,
  });
  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve()
      .then(() => loader({ signal: controller.signal }))
      .then((data) => {
        if (!controller.signal.aborted)
          setState({ data, status: "success", error: null });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({ data: null, status: "error", error });
      });
    return () => controller.abort();
  }, [loader]);
  return state;
}
