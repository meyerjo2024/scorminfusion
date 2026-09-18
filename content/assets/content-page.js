/**
 * Shared helper for module content pages loaded inside the index.html
 * iframe. Wires up the "reflection" textarea (auto-restore + autosave) and
 * the "Mark Module Complete & Continue" button, communicating with the
 * parent shell (app.js) via postMessage since each module page is a
 * separate document inside the iframe.
 */
(function () {
  "use strict";

  function initModulePage(moduleKey) {
    var textarea = document.getElementById("reflectionText");
    var completeBtn = document.getElementById("completeBtn");
    var saveNote = document.getElementById("saveNote");

    function post(message) {
      window.parent.postMessage(message, "*");
    }

    // Ask the parent shell for any previously-saved state (reflection text /
    // completion flag) so revisiting a module restores prior work.
    post({ type: "requestState", module: moduleKey });

    window.addEventListener("message", function (event) {
      var data = event.data;
      if (!data || data.type !== "stateResponse" || data.module !== moduleKey) return;
      if (textarea && data.reflection) {
        textarea.value = data.reflection;
      }
      if (completeBtn && data.completed) {
        completeBtn.textContent = "Completed \u2713 (click to re-confirm & continue)";
      }
    });

    if (textarea) {
      var saveTimer = null;
      textarea.addEventListener("input", function () {
        if (saveNote) saveNote.classList.remove("show");
        clearTimeout(saveTimer);
        saveTimer = setTimeout(function () {
          post({ type: "reflectionSaved", module: moduleKey, reflection: textarea.value });
          if (saveNote) {
            saveNote.classList.add("show");
            saveNote.textContent = "Reflection saved.";
          }
        }, 600);
      });
    }

    if (completeBtn) {
      completeBtn.addEventListener("click", function () {
        post({
          type: "moduleComplete",
          module: moduleKey,
          reflection: textarea ? textarea.value : undefined,
        });
        completeBtn.textContent = "Completed \u2713";
        completeBtn.disabled = true;
      });
    }
  }

  window.ContentPage = { init: initModulePage };
})();
