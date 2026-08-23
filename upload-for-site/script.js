// MedAI — script.js
// Small, dependency-free behaviors. No build step, no frameworks.

(function () {
  "use strict";

  // ---- food-timing chip group (onboarding.html) ----
  var chipGroup = document.querySelector('[role="radiogroup"][aria-label="תנאי נטילה"]');
  if (chipGroup) {
    var chips = chipGroup.querySelectorAll(".chip");
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) {
          c.setAttribute("aria-pressed", "false");
          c.setAttribute("aria-checked", "false");
        });
        chip.setAttribute("aria-pressed", "true");
        chip.setAttribute("aria-checked", "true");
      });
    });
  }

  // ---- "סימון כנלקח" confirm button (index.html) ----
  var confirmBtn = document.querySelector(".btn--success");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", function () {
      var label = confirmBtn.lastChild;
      if (confirmBtn.dataset.taken === "true") return;
      confirmBtn.dataset.taken = "true";
      confirmBtn.setAttribute("aria-pressed", "true");
      if (label && label.nodeType === Node.TEXT_NODE) {
        label.textContent = " סומן כנלקח ";
      }
    });
  }

  // ---- onboarding "המשך" (continue) button: simple confirmation ----
  var continueBtn = document.getElementById("continue-btn");
  if (continueBtn) {
    continueBtn.addEventListener("click", function () {
      window.location.href = "index.html";
    });
  }

  // ---- navigation drawer (menu icon -> list of screens) ----
  var menuToggle = document.getElementById("menu-toggle");
  var drawer = document.getElementById("nav-drawer");
  var overlay = document.getElementById("drawer-overlay");
  var drawerClose = document.getElementById("drawer-close");

  function openDrawer() {
    drawer.classList.add("is-open");
    overlay.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    overlay.setAttribute("aria-hidden", "false");
    menuToggle.setAttribute("aria-expanded", "true");
  }

  function closeDrawer() {
    drawer.classList.remove("is-open");
    overlay.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    overlay.setAttribute("aria-hidden", "true");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  if (menuToggle && drawer && overlay) {
    menuToggle.addEventListener("click", function () {
      if (drawer.classList.contains("is-open")) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
    overlay.addEventListener("click", closeDrawer);
    if (drawerClose) {
      drawerClose.addEventListener("click", closeDrawer);
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeDrawer();
    });
  }
})();
