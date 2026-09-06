// MedAI — script.js
// Small, dependency-free behaviors. No build step, no frameworks.

(function () {
  "use strict";

  // =========================================================
  // shared storage helpers (used across pages)
  // =========================================================
  var STORAGE_NAME = "medai_patient_name";
  var STORAGE_MEDS = "medai_new_meds";
  var STORAGE_DRAFT = "medai_onboarding_draft";

  function getName() {
    try {
      return localStorage.getItem(STORAGE_NAME) || "";
    } catch (e) {
      return "";
    }
  }

  function setName(name) {
    try {
      localStorage.setItem(STORAGE_NAME, name);
    } catch (e) {
      /* ignore */
    }
  }

  function getMeds() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_MEDS) || "[]");
    } catch (e) {
      return [];
    }
  }

  function addMed(med) {
    var meds = getMeds().filter(function (m) {
      return m.name !== med.name;
    });
    meds.push(med);
    try {
      localStorage.setItem(STORAGE_MEDS, JSON.stringify(meds));
    } catch (e) {
      /* ignore */
    }
  }

  function clearMeds() {
    try {
      localStorage.removeItem(STORAGE_MEDS);
    } catch (e) {
      /* ignore */
    }
  }

  function getDraft() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_DRAFT) || "{}");
    } catch (e) {
      return {};
    }
  }

  function mergeDraft(patch) {
    var d = getDraft();
    for (var k in patch) {
      if (Object.prototype.hasOwnProperty.call(patch, k)) d[k] = patch[k];
    }
    try {
      localStorage.setItem(STORAGE_DRAFT, JSON.stringify(d));
    } catch (e) {
      /* ignore */
    }
    return d;
  }

  function clearDraft() {
    try {
      localStorage.removeItem(STORAGE_DRAFT);
    } catch (e) {
      /* ignore */
    }
  }

  // =========================================================
  // food-timing chip group (onboarding*.html)
  // =========================================================
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

  function getSelectedChip() {
    if (!chipGroup) return null;
    var pressed = chipGroup.querySelector('.chip[aria-pressed="true"]');
    if (!pressed) return null;
    var img = pressed.querySelector("img");
    var label = pressed.textContent.replace(/\s+/g, " ").trim();
    return {
      key: pressed.getAttribute("data-chip"),
      label: label,
      icon: img ? img.getAttribute("src") : ""
    };
  }

  function selectChipByKey(key) {
    if (!chipGroup || !key) return;
    var target = chipGroup.querySelector('.chip[data-chip="' + key + '"]');
    if (target && target.getAttribute("aria-pressed") !== "true") {
      target.click();
    }
  }

  // =========================================================
  // registration.html — save patient name, continue to index
  // =========================================================
  var registerForm = document.getElementById("register-form");
  if (registerForm) {
    var regContinueBtn = document.getElementById("register-continue-btn");
    if (regContinueBtn) {
      regContinueBtn.addEventListener("click", function () {
        var nameInput = document.getElementById("reg-name");
        var name = nameInput && nameInput.value.trim();
        if (name) setName(name);
        // a fresh registration starts the demo clean: only the 3 default
        // medications show in "today's medications" until the patient adds one
        clearMeds();
        clearDraft();
        window.location.href = "index.html";
      });
    }
    var loginLink = document.getElementById("register-login-link");
    if (loginLink) {
      loginLink.addEventListener("click", function () {
        window.location.href = "index.html";
      });
    }
  }

  // =========================================================
  // dynamic patient name display (index.html / status.html)
  // =========================================================
  var savedName = getName();
  var nameSpanIndex = document.getElementById("patient-name-index");
  if (nameSpanIndex && savedName) nameSpanIndex.textContent = savedName;

  var nameSpanStatus = document.getElementById("patient-name-status");
  if (nameSpanStatus && savedName) nameSpanStatus.textContent = savedName;

  // =========================================================
  // index.html — render any newly onboarded medications
  // =========================================================
  var miniCardsList = document.getElementById("mini-cards-list");
  if (miniCardsList) {
    getMeds().forEach(function (med) {
      var article = document.createElement("article");
      article.className = "mini-card";
      var text = document.createElement("div");
      text.className = "mini-card__text";
      var time = document.createElement("p");
      time.className = "mini-card__time";
      time.textContent = med.time || "";
      var name = document.createElement("p");
      name.className = "mini-card__name";
      name.textContent = med.name || "";
      text.appendChild(time);
      text.appendChild(name);
      var img = document.createElement("img");
      img.className = "mini-card__img";
      img.src = med.photo || "assets/images/pill-generic-white.png";
      img.alt = med.name || "";
      article.appendChild(text);
      article.appendChild(img);
      miniCardsList.appendChild(article);
    });
  }

  // =========================================================
  // status.html — render any newly onboarded medications
  // =========================================================
  var statusList = document.getElementById("status-list");
  if (statusList) {
    getMeds().forEach(function (med) {
      var row = document.createElement("div");
      row.className = "status-row";
      var icon = document.createElement("img");
      icon.className = "status-row__icon";
      icon.src = "assets/icons/status-pending.png";
      icon.alt = "";
      var text = document.createElement("div");
      text.className = "status-row__text";
      var line = document.createElement("p");
      line.className = "status-row__line";
      line.textContent = (med.time || "") + " · " + (med.name || "");
      var label = document.createElement("p");
      label.className = "status-row__label status-row__label--warning";
      label.textContent = "טרם הגיע הזמן";
      text.appendChild(line);
      text.appendChild(label);
      row.appendChild(icon);
      row.appendChild(text);
      statusList.appendChild(row);
    });
  }

  // =========================================================
  // "סימון כנלקח" confirm button (index.html)
  // this button is already permanently green by design; the check icon is hidden
  // by default and only appears once the user actually confirms the dose was taken.
  // after the confirmation flashes on-screen, the app hands off to the
  // dose-confirmation screen (screen 2).
  // =========================================================
  var confirmBtn = document.getElementById("confirm-dose-btn");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", function () {
      var label = confirmBtn.lastChild;
      if (confirmBtn.dataset.taken === "true") return;
      confirmBtn.dataset.taken = "true";
      confirmBtn.setAttribute("aria-pressed", "true");
      confirmBtn.classList.add("is-confirmed");
      if (label && label.nodeType === Node.TEXT_NODE) {
        label.textContent = " סומן כנלקח ";
      }
      var next = confirmBtn.dataset.next;
      if (next) {
        window.setTimeout(function () {
          window.location.href = next;
        }, 650);
      }
    });
  }

  // =========================================================
  // "דחייה / תזכורת מאוחר יותר" snooze button (index.html)
  // color feedback lives on the button itself: white -> light orange -> back to white.
  // =========================================================
  var snoozeBtn = document.getElementById("snooze-btn");
  var snoozeTimer = null;
  if (snoozeBtn) {
    snoozeBtn.addEventListener("click", function () {
      window.clearTimeout(snoozeTimer);
      snoozeBtn.classList.add("is-snoozed");
      snoozeTimer = window.setTimeout(function () {
        snoozeBtn.classList.remove("is-snoozed");
      }, 1500);
    });
  }

  // =========================================================
  // onboarding wizard — "המשך" (continue) button
  // saves whatever fields exist on the current step into a shared draft,
  // then moves on to the page named in data-next.
  // =========================================================
  function saveCurrentStepFields() {
    var patch = {};
    var drugName = document.getElementById("drug-name");
    if (drugName) patch.name = drugName.value.trim();
    var dosage = document.getElementById("dosage");
    if (dosage) patch.dosage = dosage.value.trim();
    var doseTime = document.getElementById("dose-time");
    if (doseTime) patch.time = doseTime.value.trim();
    var frequency = document.getElementById("frequency");
    if (frequency) patch.frequency = frequency.options[frequency.selectedIndex].text;
    var chip = getSelectedChip();
    if (chip) {
      patch.foodTiming = chip.label;
      patch.foodTimingKey = chip.key;
      patch.foodTimingIcon = chip.icon;
    }
    mergeDraft(patch);
  }

  var continueBtn = document.getElementById("continue-btn");
  if (continueBtn) {
    continueBtn.addEventListener("click", function () {
      saveCurrentStepFields();
      window.location.href = continueBtn.dataset.next || "index.html";
    });
  }

  // hydrate fields on later onboarding steps from the saved draft
  var currentPage = document.body.getAttribute("data-page");

  if (currentPage === "onboarding-2") {
    var draft2 = getDraft();
    if (draft2.time) {
      var t2 = document.getElementById("dose-time");
      if (t2) t2.value = draft2.time;
    }
    if (draft2.dosage) {
      var d2 = document.getElementById("dosage");
      if (d2) d2.value = draft2.dosage;
    }
    if (draft2.foodTimingKey) selectChipByKey(draft2.foodTimingKey);
  }

  if (currentPage === "onboarding-3") {
    var draft3 = getDraft();
    var reviewName = document.getElementById("review-name");
    if (reviewName) {
      reviewName.textContent = [draft3.name, draft3.dosage].filter(Boolean).join(" ") || "התרופה החדשה";
    }
    var reviewTime = document.getElementById("review-time");
    if (reviewTime && draft3.time) reviewTime.textContent = draft3.time;
    var reviewFrequency = document.getElementById("review-frequency");
    if (reviewFrequency && draft3.frequency) reviewFrequency.textContent = draft3.frequency;
    var reviewDosage = document.getElementById("review-dosage");
    if (reviewDosage && draft3.dosage) reviewDosage.textContent = draft3.dosage;
    var reviewFoodTiming = document.getElementById("review-food-timing");
    if (reviewFoodTiming && draft3.foodTiming) reviewFoodTiming.textContent = draft3.foodTiming;

    // ---- camera mock + gallery photo picker ----
    var photoBtn = document.getElementById("photo-upload-btn");
    var galleryStrip = document.getElementById("gallery-strip");
    var photoPreview = document.getElementById("photo-upload-preview");
    var photoThumb = document.getElementById("photo-upload-thumb");
    var reviewPhoto = document.getElementById("review-photo");
    var galleryCloseBtn = document.getElementById("gallery-close-btn");
    var selectedPhoto = "assets/images/pill-generic-white.png";

    function applyPhoto(src, alt) {
      selectedPhoto = src;
      if (photoPreview) {
        photoPreview.src = src;
        photoPreview.alt = alt || "";
      }
      if (photoThumb) {
        photoThumb.src = src;
        photoThumb.alt = alt || "";
      }
      if (reviewPhoto) {
        reviewPhoto.src = src;
        reviewPhoto.alt = alt || "";
      }
    }

    if (galleryCloseBtn && galleryStrip) {
      galleryCloseBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        galleryStrip.setAttribute("hidden", "");
      });
    }

    if (photoBtn && galleryStrip) {
      photoBtn.addEventListener("click", function () {
        photoBtn.classList.add("is-flashing");
        window.setTimeout(function () {
          photoBtn.classList.remove("is-flashing");
        }, 500);

        if (galleryStrip.hasAttribute("hidden")) {
          window.setTimeout(function () {
            galleryStrip.removeAttribute("hidden");
            var defaultItem =
              galleryStrip.querySelector('.gallery-strip__item[aria-pressed="true"]') ||
              galleryStrip.querySelector(".gallery-strip__item");
            if (defaultItem) {
              var img = defaultItem.querySelector("img");
              applyPhoto(defaultItem.getAttribute("data-photo"), img ? img.alt : "");
            }
            photoBtn.classList.add("has-photo");
            photoBtn.setAttribute("aria-pressed", "true");
          }, 250);
        }
      });

      var galleryItems = galleryStrip.querySelectorAll(".gallery-strip__item");
      galleryItems.forEach(function (item) {
        item.addEventListener("click", function () {
          galleryItems.forEach(function (i) {
            i.setAttribute("aria-pressed", "false");
          });
          item.setAttribute("aria-pressed", "true");
          var img = item.querySelector("img");
          applyPhoto(item.getAttribute("data-photo"), img ? img.alt : "");
        });
      });
    }

    var saveMedBtn = document.getElementById("save-med-btn");
    if (saveMedBtn) {
      saveMedBtn.addEventListener("click", function () {
        var draftFinal = getDraft();
        var fullName = [draftFinal.name, draftFinal.dosage].filter(Boolean).join(" ") || "תרופה חדשה";
        addMed({
          id: Date.now(),
          name: fullName,
          time: draftFinal.time || "10:00",
          dosage: draftFinal.dosage || "",
          frequency: draftFinal.frequency || "",
          foodTiming: draftFinal.foodTiming || "",
          photo: selectedPhoto
        });
        clearDraft();
        window.location.href = saveMedBtn.dataset.next || "index.html";
      });
    }
  }

  // =========================================================
  // navigation drawer (menu icon -> list of screens)
  // =========================================================
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
