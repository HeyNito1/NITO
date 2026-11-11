import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import Header from "./Header";
import Footer from "./Footer";
export default function MarketingLayout() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, behavior: "instant" });
    // The homepage resource loads asynchronously; retry briefly until the anchor exists.
    let frame = 0;
    let attempts = 0;
    function scrollToHash() {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (target) target.scrollIntoView({ behavior: "instant" });
      else if (attempts++ < 90) frame = requestAnimationFrame(scrollToHash);
    }
    if (hash) frame = requestAnimationFrame(scrollToHash);
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
