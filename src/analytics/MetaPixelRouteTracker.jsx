import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackMetaPageView } from "./metaPixel";

let lastTrackedPath = "";

function MetaPixelRouteTracker() {
  const location = useLocation();

  useEffect(() => {
    const fullPath = `${location.pathname}${location.search}`;

    // Avoid duplicate PageView calls in React StrictMode/dev re-renders.
    if (fullPath === lastTrackedPath) return;

    lastTrackedPath = fullPath;
    trackMetaPageView();
  }, [location.pathname, location.search]);

  return null;
}

export default MetaPixelRouteTracker;

