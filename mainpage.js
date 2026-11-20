// Mobile navigation toggle, auto-close on link click, and footer year.
(function () {
  "use strict";

  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("navMenu");
  var yearEl = document.getElementById("year");

  function setMenu(open) {
    menu.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
  }

  toggle.addEventListener("click", function () {
    setMenu(!menu.classList.contains("open"));
  });

  // Close the menu after choosing a link (mobile)
  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      setMenu(false);
    });
  });

  // Close with the Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      setMenu(false);
    }
  });

  // Reset menu state when returning to desktop width
  window.addEventListener("resize", function () {
    if (window.innerWidth > 768) {
      setMenu(false);
    }
  });

  // Current year in footer
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();