/*
 * Ivory Center Business Hub bridge for the standalone HTML tools.
 *
 * The Price Builder and the UVP & Copy Workbench were first published as
 * claude.ai artifacts, where `window.claude.use(name)` hands them runtime
 * capabilities. This script provides the two they use, so their code runs
 * here unchanged:
 *
 *   "sample"    -> { json(prompt, { signal }) }  POSTs to /api/sample (Gemini).
 *                  Rejects with { code: "unavailable" } when the server has no
 *                  API key, and the workbench then starts in offline mode.
 *   "downloads" -> { save({ filename, data }) }  a normal browser download.
 *
 * It also marks the page as embedded when it is shown inside the hub (so the
 * tool can hide its own masthead) and exposes the hub's theme as
 * `window.hubTheme` for tools that follow it.
 *
 * Load it before the tool's own scripts.
 */
(function () {
  "use strict";

  var embedded = false;
  try { embedded = window.self !== window.top; } catch { embedded = true; }
  if (embedded) document.documentElement.classList.add("hub-embedded");

  function err(code) { var e = new Error(code); e.code = code; return e; }

  var sampleApi = null;
  var sampleCheck = null;

  function checkSample() {
    if (!sampleCheck) {
      sampleCheck = fetch("/api/sample", { cache: "no-store" })
        .then(function (r) { return r.ok ? r.json() : { available: false }; })
        .then(function (j) { return !!(j && j.available); })
        .catch(function () { return false; });
    }
    return sampleCheck;
  }

  function sampleJson(prompt, opts) {
    var signal = opts && opts.signal;
    if (signal && signal.aborted) return Promise.reject(err("cancelled"));
    return fetch("/api/sample", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: String(prompt) }),
      signal: signal,
    }).then(function (r) {
      return r.json().catch(function () { return null; }).then(function (body) {
        if (r.ok) return body;
        var code = (body && body.code) || "upstream_error";
        // The workbench understands "rate_limited" and "unavailable";
        // everything else shows its generic try-again message.
        if (code === "missing_api_key") code = "unavailable";
        throw err(code);
      });
    }, function (e) {
      throw err(e && e.name === "AbortError" ? "cancelled" : "network_error");
    });
  }

  function save(file) {
    try {
      var data = file && file.data;
      var blob = data instanceof Blob ? data : new Blob([data == null ? "" : data]);
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = (file && file.filename) || "download";
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 1500);
      return Promise.resolve();
    } catch {
      return Promise.reject(err("error"));
    }
  }

  window.claude = window.claude || {};
  window.claude.use = function (name) {
    if (name === "downloads") return Promise.resolve({ save: save });
    if (name === "sample") {
      return checkSample().then(function (ok) {
        if (!ok) throw err("unavailable");
        if (!sampleApi) sampleApi = { json: sampleJson };
        return sampleApi;
      });
    }
    return Promise.reject(err("unavailable"));
  };

  /* Theme: follow the hub's <html data-theme>, falling back to the OS. */
  function hubTheme() {
    try {
      var root = window.parent.document.documentElement;
      var t = root.getAttribute("data-theme");
      if (t === "light" || t === "dark") return t;
      return window.parent.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } catch {
      return null;
    }
  }

  window.hubTheme = {
    embedded: embedded,
    get: function () { return embedded ? hubTheme() : null; },
    subscribe: function (fn) {
      if (!embedded) return function () {};
      var mo;
      try {
        mo = new MutationObserver(function () { fn(hubTheme()); });
        mo.observe(window.parent.document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      } catch { return function () {}; }
      return function () { mo.disconnect(); };
    },
  };
})();
