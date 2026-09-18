/**
 * Minimal SCORM 1.2 Run-Time Environment adapter.
 * Implements the standard ADL "findAPI" discovery algorithm (walks the
 * window.parent / window.opener chain looking for the LMS-provided API
 * object) plus thin wrappers around the eight SCORM 1.2 API calls used by
 * this course. If no LMS API is found (e.g. the package is opened directly
 * in a browser for authoring/preview) every call degrades to a no-op /
 * console log so the course remains fully usable outside an LMS.
 */
(function (global) {
  "use strict";

  var MAX_SEARCH_DEPTH = 500;
  var api = null;
  var initialized = false;
  var standalone = false;

  function findAPI(win) {
    var depth = 0;
    while (win.API == null && win.parent != null && win.parent !== win && depth < MAX_SEARCH_DEPTH) {
      depth++;
      win = win.parent;
    }
    return win.API || null;
  }

  function getAPIHandle() {
    if (api != null) return api;

    if (global.API != null) {
      api = global.API;
    } else if (global.parent != null && global.parent !== global) {
      api = findAPI(global.parent);
    }

    if (api == null && global.opener != null) {
      api = findAPI(global.opener);
    }

    if (api == null) {
      standalone = true;
      console.warn("[SCORM] No LMS API adapter found - running in standalone/preview mode.");
    }
    return api;
  }

  function initialize() {
    var handle = getAPIHandle();
    if (standalone) return true;
    if (initialized) return true;
    var result = handle.LMSInitialize("");
    initialized = result === "true" || result === true;
    if (!initialized) {
      console.warn("[SCORM] LMSInitialize failed:", handle.LMSGetLastError && handle.LMSGetLastError());
    } else {
      // Default to incomplete on first launch unless the LMS already has a status.
      var status = handle.LMSGetValue("cmi.core.lesson_status");
      if (!status || status === "not attempted") {
        handle.LMSSetValue("cmi.core.lesson_status", "incomplete");
      }
    }
    return initialized;
  }

  function get(element) {
    if (standalone) return "";
    var handle = getAPIHandle();
    return handle.LMSGetValue(element);
  }

  function set(element, value) {
    if (standalone) {
      console.log("[SCORM:standalone] set", element, value);
      return true;
    }
    var handle = getAPIHandle();
    var result = handle.LMSSetValue(element, String(value));
    return result === "true" || result === true;
  }

  function commit() {
    if (standalone) return true;
    var handle = getAPIHandle();
    var result = handle.LMSCommit("");
    return result === "true" || result === true;
  }

  function finish() {
    if (standalone) return true;
    var handle = getAPIHandle();
    var result = handle.LMSFinish("");
    initialized = false;
    return result === "true" || result === true;
  }

  function setScore(raw, max, min) {
    set("cmi.core.score.raw", raw);
    set("cmi.core.score.max", max != null ? max : 100);
    set("cmi.core.score.min", min != null ? min : 0);
  }

  function setStatus(status) {
    // Valid SCORM 1.2 values: passed, completed, failed, incomplete, browsed, not attempted
    set("cmi.core.lesson_status", status);
  }

  function setSuspendData(dataObject) {
    try {
      var str = JSON.stringify(dataObject);
      // SCORM 1.2 suspend_data has a practical LMS limit (commonly 4096 chars).
      if (str.length > 4000) {
        console.warn("[SCORM] suspend_data truncated - exceeds 4000 chars.");
        str = str.slice(0, 4000);
      }
      return set("cmi.suspend_data", str);
    } catch (e) {
      console.error("[SCORM] Failed to serialize suspend_data", e);
      return false;
    }
  }

  function getSuspendData() {
    var raw = get("cmi.suspend_data");
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch (e) {
      return {};
    }
  }

  function setSessionTime(hhmmss) {
    set("cmi.core.session_time", hhmmss);
  }

  global.Scorm = {
    initialize: initialize,
    get: get,
    set: set,
    commit: commit,
    finish: finish,
    setScore: setScore,
    setStatus: setStatus,
    setSuspendData: setSuspendData,
    getSuspendData: getSuspendData,
    setSessionTime: setSessionTime,
    isStandalone: function () {
      return standalone;
    },
  };
})(window);
