/* =========================================================
   CONFIGURATION — edit these before sending the invitation
   ========================================================= */
const CONFIG = {
  // --- Supabase ---
  // Create a project at https://supabase.com, then paste your
  // Project URL and public "anon" key below. See supabase_setup.sql
  // for the table this expects.
  supabaseUrl: "https://nqvjlwxbneyhonbxpfjj.supabase.co",
  supabaseAnonKey: "sb_publishable_AxWxh7HGlLntbSEU1AYnZA_2raUKPKA",
  supabaseTable: "InvitationResponses",

  // --- Content ---
  movieTitle: "Evil Dead Burn",
  movieDescription: "A night in the dark, if you dare.",
  movieTrailerUrl: "", // paste a trailer URL to show the "Watch trailer" button

  restaurantName: "REPLACE_WITH_RESTAURANT_NAME",
  restaurantAddress: "REPLACE_WITH_ADDRESS",
  restaurantNote: "", // e.g. "Table booked for two, 8:30pm"

  finalMessage: "I can't wait to spend this moment with you.",

  // --- Ambient audio (optional) ---
  // Paste a hosted mp3 URL to enable the soft piano toggle. Leave empty to disable.
  ambientAudioUrl: ""
};

/* =========================================================
   CONFIG APPLICATION
   ========================================================= */
function applyConfig() {
  document.getElementById("movieTitleSlot").textContent = CONFIG.movieTitle;
  document.getElementById("movieTitleText").textContent = CONFIG.movieTitle;
  document.getElementById("movieDesc").textContent = CONFIG.movieDescription;
  document.getElementById("restaurantName").textContent = CONFIG.restaurantName;
  document.getElementById("restaurantAddress").textContent = CONFIG.restaurantAddress;
  document.getElementById("restaurantNote").textContent = CONFIG.restaurantNote;
  document.getElementById("finalMessage").textContent = CONFIG.finalMessage;

  const trailerBtn = document.getElementById("trailerBtn");
  if (CONFIG.movieTrailerUrl) {
    trailerBtn.hidden = false;
    trailerBtn.addEventListener("click", () => window.open(CONFIG.movieTrailerUrl, "_blank", "noopener"));
  }

  const audioEl = document.getElementById("ambientAudio");
  if (CONFIG.ambientAudioUrl) {
    audioEl.querySelector("source").src = CONFIG.ambientAudioUrl;
    audioEl.load();
  } else {
    document.getElementById("soundToggle").style.display = "none";
  }
}

/* =========================================================
   AMBIENT EMBERS — lightweight canvas particles
   ========================================================= */
function initEmbers() {
  const canvas = document.getElementById("embers");
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let particles = [];
  let raf;

  function resize() {
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
  }

  function makeParticle() {
    return {
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + Math.random() * 100,
      r: 0.6 + Math.random() * 1.8,
      speed: 0.15 + Math.random() * 0.35,
      drift: (Math.random() - 0.5) * 0.3,
      alpha: 0.15 + Math.random() * 0.35,
      flicker: Math.random() * Math.PI * 2
    };
  }

  function init() {
    resize();
    const count = window.innerWidth < 640 ? 22 : 40;
    particles = Array.from({ length: count }, makeParticle);
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(devicePixelRatio, devicePixelRatio);
    for (const p of particles) {
      p.y -= p.speed;
      p.x += p.drift;
      p.flicker += 0.03;
      if (p.y < -20) Object.assign(p, makeParticle(), { y: window.innerHeight + 20 });
      const a = p.alpha * (0.7 + 0.3 * Math.sin(p.flicker));
      ctx.beginPath();
      ctx.fillStyle = `rgba(232, 147, 91, ${a})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    raf = requestAnimationFrame(tick);
  }

  init();
  window.addEventListener("resize", init);

  if (!reduceMotion) {
    tick();
  } else {
    // Draw a single static frame for reduced-motion users
    ctx.save();
    ctx.scale(devicePixelRatio, devicePixelRatio);
    for (const p of particles) {
      ctx.beginPath();
      ctx.fillStyle = `rgba(232, 147, 91, ${p.alpha})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

/* =========================================================
   SCENE MANAGER
   ========================================================= */
function goToScene(id) {
  const current = document.querySelector(".scene-active");
  const next = document.getElementById(id);
  if (current === next) return;

  if (current) {
    current.classList.add("scene-leaving");
    current.classList.remove("scene-active");
    setTimeout(() => current.classList.remove("scene-leaving"), 700);
  }
  // slight delay so the fade-out and fade-in overlap gently
  requestAnimationFrame(() => {
    next.classList.add("scene-active");
  });
  next.setAttribute("tabindex", "-1");
  next.focus({ preventScroll: true });
}

/* =========================================================
   ENVELOPE + LETTER OPENING
   ========================================================= */
function initEnvelope() {
  const envelopeBtn = document.getElementById("envelopeBtn");
  const envelopeStage = document.querySelector(".envelope-stage");
  const letter = document.getElementById("letter");
  let opened = false;

  envelopeBtn.addEventListener("click", () => {
    if (opened) return;
    opened = true;
    envelopeBtn.classList.add("open");
    envelopeBtn.setAttribute("aria-label", "Invitation opening");

    setTimeout(() => {
      envelopeStage.classList.add("hide");
      letter.classList.add("rise");
    }, 550);

    setTimeout(() => {
      goToScene("scene-question");
    }, 3200);
  });
}

/* =========================================================
   SOUND TOGGLE
   ========================================================= */
function initSound() {
  const btn = document.getElementById("soundToggle");
  const audioEl = document.getElementById("ambientAudio");
  let playing = false;

  btn.addEventListener("click", () => {
    if (!CONFIG.ambientAudioUrl) return;
    playing = !playing;
    btn.setAttribute("aria-pressed", String(playing));
    if (playing) {
      audioEl.volume = 0.25;
      audioEl.play().catch(() => {});
    } else {
      audioEl.pause();
    }
  });
}

/* =========================================================
   THE QUESTION — Yes stays put, No dodges after first attempt
   ========================================================= */
function initQuestion() {
  const card = document.querySelector(".question-card");
  const btnRow = document.getElementById("btnRow");
  const yesBtn = document.getElementById("yesBtn");
  const noBtn = document.getElementById("noBtn");
  const hint = document.getElementById("noHint");
  let dodgeCount = 0;

  const nudges = [
    "Nice try.",
    "Not today.",
    "Almost had it!",
    "Keep trying, I dare you.",
    "It's not going anywhere... except away from you."
  ];

  function dodge() {
    dodgeCount += 1;
    if (!btnRow.classList.contains("no-roaming")) {
      // measure current position before switching to absolute so the jump is seamless
      const rowRect = btnRow.getBoundingClientRect();
      const btnRect = noBtn.getBoundingClientRect();
      btnRow.classList.add("no-roaming");
      noBtn.style.left = (btnRect.left - rowRect.left) + "px";
      noBtn.style.top = (btnRect.top - rowRect.top) + "px";
      // force reflow so the transition applies to the *next* move only
      // eslint-disable-next-line no-unused-expressions
      noBtn.offsetHeight;
    }

    const cardRect = card.getBoundingClientRect();
    const btnW = noBtn.offsetWidth;
    const btnH = noBtn.offsetHeight;
    const yesRect = yesBtn.getBoundingClientRect();

    const padding = 18;
    const maxLeft = Math.max(padding, cardRect.width - btnW - padding);
    const maxTop = Math.max(padding, cardRect.height - btnH - padding);

    let placed = false;
    let attempts = 0;
    let left, top;
    while (!placed && attempts < 20) {
      left = padding + Math.random() * (maxLeft - padding);
      top = padding + Math.random() * (maxTop - padding);
      // avoid overlapping the Yes button (in card-local coordinates)
      const yesLeft = yesRect.left - cardRect.left;
      const yesTop = yesRect.top - cardRect.top;
      const overlap = !(
        left + btnW < yesLeft - 12 ||
        left > yesLeft + yesRect.width + 12 ||
        top + btnH < yesTop - 12 ||
        top > yesTop + yesRect.height + 12
      );
      if (!overlap) placed = true;
      attempts += 1;
    }

    noBtn.style.left = left + "px";
    noBtn.style.top = top + "px";

    hint.textContent = nudges[Math.min(dodgeCount - 1, nudges.length - 1)];
  }

  // Desktop: dodge on hover intent. Mobile: dodge on touchstart before a real tap registers.
  noBtn.addEventListener("pointerenter", (e) => {
    if (e.pointerType === "mouse") dodge();
  });
  noBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    dodge();
  }, { passive: false });
  noBtn.addEventListener("click", (e) => {
    // if somehow clicked (keyboard, or fast pointer), just dodge instead of doing anything
    e.preventDefault();
    dodge();
  });
  noBtn.addEventListener("focus", () => {
    // keyboard users: let them know, but don't trap them — dodge on attempted activation instead
  });
  noBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      dodge();
    }
  });

  yesBtn.addEventListener("click", () => {
    goToScene("scene-form");
  });
}

/* =========================================================
   AVAILABILITY FORM — validation + Supabase insert
   ========================================================= */
function initForm() {
  const form = document.getElementById("availabilityForm");
  const status = document.getElementById("formStatus");
  const continueBtn = document.getElementById("continueBtn");
  const spinner = continueBtn.querySelector(".btn-spinner");
  const label = continueBtn.querySelector(".btn-label");

  const fields = ["dateField", "timeField", "curfewField"].map((id) => document.getElementById(id));

  function setError(fieldEl, message) {
    const errorEl = form.querySelector(`.field-error[data-for="${fieldEl.id}"]`);
    if (message) {
      fieldEl.classList.add("invalid");
      errorEl.textContent = message;
      errorEl.classList.add("show");
    } else {
      fieldEl.classList.remove("invalid");
      errorEl.textContent = "";
      errorEl.classList.remove("show");
    }
  }

  fields.forEach((f) => {
    f.addEventListener("input", () => setError(f, ""));
  });

  async function submitToSupabase(payload) {
    const endpoint = `${CONFIG.supabaseUrl}/rest/v1/${CONFIG.supabaseTable}`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": CONFIG.supabaseAnonKey,
        "Authorization": `Bearer ${CONFIG.supabaseAnonKey}`,
        // return=minimal: the site only ever needs to know the insert succeeded,
        // never to read the row back — so no SELECT grant is required at all.
        "Prefer": "return=minimal"
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Supabase insert failed (${res.status}): ${text}`);
    }
    return true;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "";
    status.classList.remove("error");

    let valid = true;
    fields.forEach((f) => {
      if (!f.value) {
        setError(f, "This detail is needed before we continue.");
        valid = false;
      } else {
        setError(f, "");
      }
    });
    if (!valid) return;

    const payload = {
      availability_date: document.getElementById("dateField").value,
      availability_time: document.getElementById("timeField").value,
      curfew: document.getElementById("curfewField").value
    };

    continueBtn.disabled = true;
    spinner.hidden = false;
    label.textContent = "Sending...";

    try {
      await submitToSupabase(payload);
      goToScene("scene-surprise");
    } catch (err) {
      console.error(err);
      status.textContent = "Something went wrong sending your answer. Please try again.";
      status.classList.add("error");
    } finally {
      continueBtn.disabled = false;
      spinner.hidden = true;
      label.textContent = "Continue";
    }
  });
}

/* =========================================================
   INIT
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  applyConfig();
  initEmbers();
  initEnvelope();
  initSound();
  initQuestion();
  initForm();
});
