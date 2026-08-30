// ===================== STACYCHAD site logic =====================

// --- CONFIG: fill these in once they exist, everything below adapts automatically ---
const CONFIG = {
  CA: "", // <-- paste the deployed contract address here once minted, e.g. "6q38...pump"
  TWITTER_URL: "https://x.com/stacychadsol", // placeholder — update once the account exists
  TELEGRAM_URL: "", // placeholder — leave empty to disable the Telegram link
  CHART_URL: "https://dexscreener.com/solana", // placeholder until CA is live, then swap for the direct pair URL
};

// ---------- Boot / sequencing screen ----------
(function boot() {
  const screen = document.getElementById("boot-screen");
  const skipBtn = document.getElementById("boot-skip");
  const lines = document.querySelectorAll(".boot-line");

  lines.forEach((line, i) => {
    setTimeout(() => {
      line.textContent = line.dataset.text;
      line.classList.add("show");
    }, i * 420);
  });

  function finishBoot() {
    screen.classList.add("hidden");
  }

  // auto-dismiss shortly after the fusion flash/reveal has played in the hero
  const autoTimer = setTimeout(finishBoot, 3400);

  skipBtn.addEventListener("click", () => {
    clearTimeout(autoTimer);
    finishBoot();
  });
})();

// ---------- Nav / footer link wiring ----------
(function wireLinks() {
  const map = [
    ["link-x", CONFIG.TWITTER_URL],
    ["link-x-2", CONFIG.TWITTER_URL],
    ["link-x-3", CONFIG.TWITTER_URL],
    ["link-chart", CONFIG.CHART_URL],
    ["link-chart-2", CONFIG.CHART_URL],
    ["link-chart-3", CONFIG.CHART_URL],
    ["link-tg", CONFIG.TELEGRAM_URL],
  ];
  map.forEach(([id, url]) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (url) {
      el.href = url;
    } else {
      el.style.opacity = "0.4";
      el.style.pointerEvents = "none";
      el.textContent = el.textContent + " (soon)";
    }
  });
})();

// ---------- Contract address: copy + live badge ----------
(function ca() {
  const valueEl = document.getElementById("ca-value");
  const copyBtn = document.getElementById("ca-copy");

  if (CONFIG.CA) {
    valueEl.textContent = CONFIG.CA;
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(CONFIG.CA).then(() => {
        const original = copyBtn.textContent;
        copyBtn.textContent = "✓";
        setTimeout(() => (copyBtn.textContent = original), 1200);
      });
    });
  } else {
    copyBtn.disabled = true;
    copyBtn.style.opacity = "0.3";
    copyBtn.style.cursor = "default";
  }
})();

// ---------- Stat bars: fill in on scroll into view ----------
(function statBars() {
  const rows = document.querySelectorAll(".stat-row");
  if (!("IntersectionObserver" in window)) {
    rows.forEach((row) => {
      row.style.setProperty("--w", row.dataset.value + "%");
      row.classList.add("filled");
    });
    return;
  }
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const row = entry.target;
          row.style.setProperty("--w", row.dataset.value + "%");
          row.classList.add("filled");
          obs.unobserve(row);
        }
      });
    },
    { threshold: 0.4 }
  );
  rows.forEach((row) => obs.observe(row));
})();

// ---------- Mog counter: playful count-up, resets to a new absurd number each view ----------
(function mogCounter() {
  const el = document.getElementById("mog-counter");
  if (!el) return;
  let done = false;

  function animateTo(target) {
    const duration = 1600;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(eased * target).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString() + "+";
    }
    requestAnimationFrame(tick);
  }

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !done) {
          done = true;
          animateTo(9827); // arbitrary bit — this is a joke stat, not a real metric
          obs.disconnect();
        }
      });
    },
    { threshold: 0.5 }
  );
  obs.observe(el);
})();

// ---------- Optional: live price/mcap from DexScreener once a CA exists ----------
// If you later want real numbers on the page (price / mcap / holders-ish data),
// add an element with id="live-stats" in index.html and this will populate it.
// Left inactive until CONFIG.CA is filled in — never fabricate numbers in the meantime.
(async function liveData() {
  if (!CONFIG.CA) return;
  const target = document.getElementById("live-stats");
  if (!target) return;
  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${CONFIG.CA}`);
    const data = await res.json();
    const pair = data && data.pairs && data.pairs[0];
    if (!pair) return;
    target.innerHTML = `
      <span>Price: $${Number(pair.priceUsd).toPrecision(4)}</span>
      <span>MCap: $${Number(pair.fdv || 0).toLocaleString()}</span>
    `;
  } catch (e) {
    console.warn("DexScreener fetch failed, leaving placeholder in place.", e);
  }
})();
