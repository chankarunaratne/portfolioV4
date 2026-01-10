// Lightweight cross-page fade for a more seamless transition between static pages.
// Only intercepts same-tab HTML navigations (e.g., index.html <-> about.html).
(function () {
  function isModifiedClick(e) {
    return e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;
  }

  function isSamePageHashNavigation(href) {
    try {
      const url = new URL(href, window.location.href);
      return (
        url.pathname === window.location.pathname &&
        url.search === window.location.search &&
        url.hash &&
        url.hash.length > 1
      );
    } catch {
      return false;
    }
  }

  function isHtmlNavigation(href) {
    if (!href) return false;
    // Allow "about.html", "index.html#section", "./about.html", etc.
    return /\.html(\?|#|$)/i.test(href);
  }

  function getPageRoot() {
    return document.querySelector(".page-root") || document.body;
  }

  function markEntered() {
    const root = getPageRoot();
    root.classList.add("page-ready");
    root.classList.remove("page-leave");
  }

  function navigateWithFade(href) {
    const root = getPageRoot();
    root.classList.add("page-leave");

    // Match CSS transition duration.
    window.setTimeout(() => {
      window.location.href = href;
    }, 180);
  }

  window.addEventListener("pageshow", () => {
    // Covers back/forward cache as well.
    markEntered();
  });

  document.addEventListener("DOMContentLoaded", () => {
    markEntered();

    document.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;

      const link = target.closest("a");
      if (!link) return;
      if (isModifiedClick(e)) return;
      if (link.target && link.target !== "_self") return;

      const href = link.getAttribute("href");
      if (!href) return;
      if (!isHtmlNavigation(href)) return;
      if (isSamePageHashNavigation(href)) return;

      e.preventDefault();
      navigateWithFade(href);
    });
  });
})();

