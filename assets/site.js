(function () {
  /* Masthead figure: |J_j(2Jt)|^2 for a single flipped spin (free magnon), J = 1.
     Bessel functions by the trapezoidal rule on the periodic integral
     J_n(x) = (1 / 2 pi) * integral over [0, 2 pi] of cos(n tau - x sin tau),
     which converges exponentially once the sample count exceeds n + x. */
  var canvas = document.getElementById("cone");
  if (!canvas || !canvas.getContext) { return; }
  var SITES = 121, HALF = 60, COLS = 300, TMAX = 30, M = 256;
  var sinT = new Float64Array(M), tau = new Float64Array(M);
  for (var k = 0; k < M; k++) { tau[k] = 2 * Math.PI * k / M; sinT[k] = Math.sin(tau[k]); }
  function besselJ(n, x) {
    var s = 0;
    for (var k = 0; k < M; k++) { s += Math.cos(n * tau[k] - x * sinT[k]); }
    return s / M;
  }
  var field = new Float64Array(SITES * COLS), peak = 0;
  for (var c = 0; c < COLS; c++) {
    var x = 2 * TMAX * c / (COLS - 1);
    for (var n = 0; n <= HALF; n++) {
      var p = besselJ(n, x); p = p * p;
      field[(HALF + n) * COLS + c] = p;
      field[(HALF - n) * COLS + c] = p;
    }
  }
  /* Display: probability weighted by distance from the flipped site, so that the
     front stays visible as it spreads; square root for the tone curve. */
  var img = new ImageData(COLS, SITES);
  for (var r = 0; r < SITES; r++) {
    var w = 1 + Math.abs(r - HALF);
    for (var c2 = 0; c2 < COLS; c2++) {
      var v = field[r * COLS + c2] * w; if (v > peak) { peak = v; }
    }
  }
  for (var r2 = 0; r2 < SITES; r2++) {
    var w2 = 1 + Math.abs(r2 - HALF);
    for (var c3 = 0; c3 < COLS; c3++) {
      var t = Math.sqrt(field[r2 * COLS + c3] * w2 / peak);
      var i = 4 * (r2 * COLS + c3);
      img.data[i]     = 8  + t * (78 - 8);
      img.data[i + 1] = 8  + t * (173 - 8);
      img.data[i + 2] = 11 + t * (165 - 11);
      img.data[i + 3] = 255;
    }
  }
  var off = document.createElement("canvas");
  off.width = COLS; off.height = SITES;
  off.getContext("2d").putImageData(img, 0, 0);
  function draw() {
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    var g = canvas.getContext("2d");
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = "high";
    g.drawImage(off, 0, 0, canvas.width, canvas.height);
  }
  draw();
  window.addEventListener("resize", draw);
})();

(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var items = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("seen"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("seen"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.06 });
    items.forEach(function (el) { io.observe(el); });
  }
  var links = Array.prototype.slice.call(document.querySelectorAll("nav.bar a.sec"));
  var targets = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });
  function mark() {
    var best = -1;
    for (var i = 0; i < targets.length; i++) {
      if (targets[i] && targets[i].getBoundingClientRect().top <= window.innerHeight * 0.35) { best = i; }
    }
    links.forEach(function (a, i) {
      if (i === best) { a.setAttribute("aria-current", "true"); } else { a.removeAttribute("aria-current"); }
    });
  }
  mark();
  window.addEventListener("scroll", mark, { passive: true });
})();

(function () {
  var list = document.getElementById("paperlist");
  if (!list) { return; }
  var items = Array.prototype.slice.call(list.children);
  var bar = Array.prototype.slice.call(document.querySelectorAll(".tagbar button.tag"));
  function apply(tag) {
    var want = tag.split(" ");
    items.forEach(function (li) {
      var have = " " + li.getAttribute("data-tags") + " ";
      var on = tag === "all" || want.some(function (t) { return have.indexOf(" " + t + " ") >= 0; });
      if (on) { li.removeAttribute("hidden"); } else { li.setAttribute("hidden", ""); }
    });
    bar.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-tag") === tag ? "true" : "false"); });
  }
  function go(tag) {
    apply(tag);
    var p = document.getElementById("papers");
    p.classList.add("seen");
    p.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
  bar.forEach(function (b) { b.addEventListener("click", function () { apply(b.getAttribute("data-tag")); }); });
  Array.prototype.slice.call(document.querySelectorAll("ul.refs .tags button.tag")).forEach(function (b) {
    b.addEventListener("click", function () { go(b.getAttribute("data-tag")); });
  });
  Array.prototype.slice.call(document.querySelectorAll("a[data-goto]")).forEach(function (a) {
    a.addEventListener("click", function (ev) { ev.preventDefault(); go(a.getAttribute("data-goto")); });
  });
})();
