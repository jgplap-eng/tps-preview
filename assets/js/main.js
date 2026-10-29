/* Tessavi Pilates Studio — interactions + conversion tracking
   ------------------------------------------------------------
   1) Paste your IDs below. Leave blank to disable a platform.
   2) Every CTA carries data-track="<event>" and data-loc="<where on the page>".
      Events sent (GA4 + Meta Pixel + dataLayer for GTM):
        book_click        -> rezerv timetable (also GA4 'generate_lead', Meta 'Schedule')
        messenger_click   -> m.me Messenger   (also GA4 'generate_lead', Meta 'Contact')
        call_click        -> tel: link         (also GA4 'generate_lead', Meta 'Contact')
        facebook_click    -> Facebook page
        instagram_click   -> Instagram profile
        email_click       -> mailto
        directions_click  -> Waze / Google Maps / Apple Maps (param: provider)
   In GA4: Admin > Events > mark book_click, messenger_click, call_click as key events. */
window.TESSAVI_CONFIG = window.TESSAVI_CONFIG || {
  GA4_ID: "",          // e.g. "G-XXXXXXXXXX"
  GTM_ID: "",          // e.g. "GTM-XXXXXXX" (optional; if set, GA4_ID can stay blank and GTM handles tags)
  META_PIXEL_ID: ""    // e.g. "1234567890"
};

(function () {
  "use strict";
  var cfg = window.TESSAVI_CONFIG;
  var d = document;
  d.documentElement.classList.add("js");
  window.dataLayer = window.dataLayer || [];

  /* ---------- analytics loaders ---------- */
  function loadScript(src, attrs) {
    var s = d.createElement("script"); s.async = true; s.src = src;
    if (attrs) Object.keys(attrs).forEach(function (k) { s.setAttribute(k, attrs[k]); });
    d.head.appendChild(s);
  }
  if (cfg.GTM_ID) {
    window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    loadScript("https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(cfg.GTM_ID));
  }
  if (cfg.GA4_ID) {
    loadScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(cfg.GA4_ID));
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", cfg.GA4_ID, { transport_type: "beacon" });
  }
  if (cfg.META_PIXEL_ID) {
    /* Meta Pixel base code (official snippet, condensed) */
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, d, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", cfg.META_PIXEL_ID);
    window.fbq("track", "PageView");
  }

  /* ---------- click tracking ---------- */
  var LEAD_EVENTS = { book_click: "Schedule", messenger_click: "Contact", call_click: "Contact" };
  function track(name, params) {
    params = params || {};
    params.page_path = location.pathname;
    params.page_title = d.title;
    try { window.dataLayer.push(Object.assign({ event: name }, params)); } catch (e) {}
    try { if (window.gtag && cfg.GA4_ID) window.gtag("event", name, params); } catch (e) {}
    try {
      if (window.fbq && cfg.META_PIXEL_ID) {
        window.fbq("trackCustom", name, params);
        if (LEAD_EVENTS[name]) window.fbq("track", LEAD_EVENTS[name], { content_name: params.cta_location || "" });
      }
    } catch (e) {}
    if (LEAD_EVENTS[name]) {
      try { window.dataLayer.push({ event: "generate_lead", lead_source: name, cta_location: params.cta_location }); } catch (e) {}
      try { if (window.gtag && cfg.GA4_ID) window.gtag("event", "generate_lead", { lead_source: name, cta_location: params.cta_location, page_path: location.pathname }); } catch (e) {}
    }
  }
  d.addEventListener("click", function (ev) {
    var a = ev.target.closest("[data-track]");
    if (!a) return;
    track(a.getAttribute("data-track"), {
      cta_location: a.getAttribute("data-loc") || "",
      provider: a.getAttribute("data-provider") || "",
      link_url: a.getAttribute("href") || "",
      link_text: (a.textContent || "").trim().slice(0, 60)
    });
  }, { passive: true });
  window.tessaviTrack = track;

  /* ---------- header + mobile menu ---------- */
  var header = d.querySelector(".header");
  var onScroll = function () { if (header) header.classList.toggle("scrolled", window.scrollY > 8); };
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });

  var burger = d.querySelector(".burger");
  var menu = d.getElementById("menu");
  if (burger && menu) {
    var setMenu = function (open) {
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      menu.classList.toggle("open", open);
      menu.setAttribute("aria-hidden", open ? "false" : "true");
      d.body.style.overflow = open ? "hidden" : "";
    };
    burger.addEventListener("click", function () { setMenu(burger.getAttribute("aria-expanded") !== "true"); });
    menu.querySelectorAll("a").forEach(function (l) { l.addEventListener("click", function () { setMenu(false); }); });
    d.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
    window.addEventListener("resize", function () { if (window.innerWidth >= 1240) setMenu(false); });
  }

  /* ---------- reveal (only for elements below the fold at load) ---------- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("IntersectionObserver" in window && !reduce) {
    var els = Array.prototype.slice.call(d.querySelectorAll("[data-reveal]"));
    var vh = window.innerHeight || 800;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); en.target.classList.remove("pre"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach(function (el) {
      if (el.getBoundingClientRect().top > vh) { el.classList.add("pre"); io.observe(el); }
    });
  }

  /* ---------- footer year ---------- */
  var y = d.getElementById("year"); if (y) y.textContent = new Date().getFullYear();

  /* ---------- copy phone number ---------- */
  d.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var val = btn.getAttribute("data-copy"), done = function () { var t = btn.textContent; btn.textContent = "Copied"; setTimeout(function () { btn.textContent = t; }, 1600); };
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(val).then(done).catch(function () { window.getSelection && window.getSelection().selectAllChildren(btn.previousElementSibling || btn); }); }
    });
  });
})();
