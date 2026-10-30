// New arcade site: retire the previous site's offline cache and service worker.
// No manager code is loaded by this website.
(function () {
  var year = document.getElementById("copyright-year");
  if (year) year.textContent = String(new Date().getFullYear());
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
      registrations.forEach(function (registration) {
        try {
          var path = new URL(registration.scope).pathname.toLowerCase();
          if (path.includes("/football-lab/")) registration.unregister();
        } catch (_) {}
      });
    }).catch(function () {});
  }
  if ("caches" in window) {
    caches.keys().then(function (keys) {
      keys.forEach(function (key) {
        if (/football[-_ ]?lab|manager/i.test(key)) caches.delete(key);
      });
    }).catch(function () {});
  }
})();
