/**
 * Course-shell controller for Paramedic Infusion Therapy SCORM package.
 * Single-module course with final assessment.
 */
(function () {
  "use strict";

  var MODULES = [
    { key: "module1", file: "module1.html", label: "Infusion Therapy &amp; Drug Calculations (120 min)" },
    { key: "assessment", file: "assessment.html", label: "Final Assessment (40 Marks)" },
  ];

  var state = {
    current: "module1",
    completed: {},
    reflections: {},
    assessment: { attempted: false, score: null, max: 40, passed: false },
  };

  var frame = document.getElementById("contentFrame");
  var navEl = document.getElementById("courseNav");
  var progressFill = document.getElementById("progressFill");
  var progressLabel = document.getElementById("progressLabel");

  function loadState() {
    var saved = window.Scorm.getSuspendData();
    if (saved && saved.completed) {
      state = saved;
    }
  }

  function saveState() {
    window.Scorm.setSuspendData(state);
    window.Scorm.commit();
  }

  function moduleComplete() {
    return !!state.completed["module1"];
  }

  function computeProgressPercent() {
    if (state.assessment.attempted) return 100;
    if (moduleComplete()) return 50;
    return 0;
  }

  function updateProgressBar() {
    var pct = computeProgressPercent();
    progressFill.style.width = pct + "%";
    progressLabel.textContent = Math.round(pct) + "% complete";
  }

  function renderNav() {
    navEl.innerHTML = "";
    MODULES.forEach(function (m, idx) {
      var a = document.createElement("a");
      a.href = "#";
      a.dataset.key = m.key;
      var locked = m.key === "assessment" && !moduleComplete();
      var complete = !!state.completed[m.key] || (m.key === "assessment" && state.assessment.attempted);

      var num = document.createElement("span");
      num.className = "step-num";
      num.textContent = complete ? "\u2713" : idx + 1;
      a.appendChild(num);

      var text = document.createElement("span");
      text.textContent = m.label;
      a.appendChild(text);

      if (m.key === state.current) a.classList.add("active");
      if (complete) a.classList.add("complete");
      if (locked) {
        a.classList.add("locked");
        a.title = "Complete the module to unlock the final assessment.";
      }

      a.addEventListener("click", function (e) {
        e.preventDefault();
        if (locked) return;
        navigateTo(m.key);
      });

      navEl.appendChild(a);
    });
  }

  function navigateTo(key) {
    var mod = MODULES.filter(function (m) {
      return m.key === key;
    })[0];
    if (!mod) return;
    state.current = key;
    frame.src = mod.file;
    renderNav();
    saveState();
  }

  function markModuleComplete(key, reflectionText) {
    state.completed[key] = true;
    if (typeof reflectionText === "string") {
      state.reflections[key] = reflectionText;
    }
    updateProgressBar();
    renderNav();
    saveState();
    window.Scorm.setStatus("incomplete");
  }

  function recordAssessmentResult(score, max) {
    state.assessment.attempted = true;
    state.assessment.score = score;
    state.assessment.max = max;
    var passed = score >= Math.ceil(max * 0.6);
    state.assessment.passed = passed;
    updateProgressBar();
    renderNav();
    saveState();

    window.Scorm.setScore(score, max, 0);
    window.Scorm.setStatus(passed ? "passed" : "failed");
    window.Scorm.commit();
  }

  window.addEventListener("message", function (event) {
    var data = event.data;
    if (!data || typeof data !== "object") return;

    if (data.type === "moduleComplete") {
      markModuleComplete(data.module, data.reflection);
      var next = MODULES[MODULES.findIndex(function (m) {
        return m.key === data.module;
      }) + 1];
      if (next) navigateTo(next.key);
    } else if (data.type === "reflectionSaved") {
      state.reflections[data.module] = data.reflection;
      saveState();
    } else if (data.type === "assessmentSubmitted") {
      recordAssessmentResult(data.score, data.max);
    } else if (data.type === "requestState") {
      frame.contentWindow.postMessage(
        {
          type: "stateResponse",
          module: data.module,
          completed: !!state.completed[data.module],
          reflection: state.reflections[data.module] || "",
          assessment: state.assessment,
        },
        "*"
      );
    }
  });

  function init() {
    window.Scorm.initialize();
    loadState();
    frame.src = MODULES.filter(function (m) {
      return m.key === state.current;
    })[0].file;
    renderNav();
    updateProgressBar();
  }

  window.addEventListener("beforeunload", function () {
    saveState();
  });

  document.addEventListener("DOMContentLoaded", init);
})();
