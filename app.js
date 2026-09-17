const state = {
  models: [],
  filter: "all"
};

const featuredIds = [
  "qwen38_27b_q8",
  "glm_53_iq4_xs",
  "chatgpt_5_6_sol_high",
  "glm_53_iq2_xxs"
];

const byRank = (a, b) => a.rank - b.rank;
const typeLabel = model => model.type === "Lokálny"
  ? `<span data-i18n="en">Local</span><span data-i18n="sk">Lokálny</span>`
  : "Cloud";
const modelUrl = model => `viewer.html?model=${encodeURIComponent(model.id)}`;

const englishCopy = {
  qwen38_27b_q8: {
    summary: "The strongest overall output. It is not just a canvas animation, but a complete interactive deep-sea diorama with HUD, depth gauge, current, bubbles, fish, ripple effects, and thoughtful interaction.",
    code: "Uses dt, DPR, a performance guard, prefers-reduced-motion, stable object state, and entity limits. Very strong engineering discipline for a local model.",
    ux: "Goes far beyond the prompt: pause, current strength, jellyfish spawning, depth scrolling, FPS, and ocean zones. The interface supports the experience instead of decorating it."
  },
  chatgpt_5_6_sol_high: {
    summary: "The most balanced cloud output. It has strong composition, color clouds, parallax, particles, bubbles, light rays, and a seabed silhouette without collapsing into visual noise.",
    code: "Stable structure, good DPR handling, responsive canvas behavior, and object state. Less playful than Qwen38, but very cleanly executed.",
    ux: "More visual scene than controllable product. Cursor interaction is subtle and does not distract."
  },
  glm_53_iq4_xs: {
    summary: "One of the most visually pleasant results. It is less crowded than IQ2, and that restraint makes it feel cleaner and more elegant. Good pulsing, light, plankton, and interaction.",
    code: "Uses DPR, dt, a Jelly class, bubbles, plankton, and click-to-add interaction. A sensibly layered implementation without unnecessary complexity.",
    ux: "Gentle cursor and click interaction. The UI stays minimal and keeps the scene in focus."
  },
  glm_53_iq2_xxs: {
    summary: "The richest original local output. It includes distant jellyfish, fish, kelp, seabed, sparks, bubbles, and interaction. Visually, though, it is denser and less clean than IQ4.",
    code: "Technically impressive: dt, DPR, layering, caps, interaction, and separated systems. Very strong given the quantization level.",
    ux: "Clicking creates new jellyfish and effects. A strong demo, though less information-designed than Qwen38."
  },
  chatgpt_5_6_sol_medium: {
    summary: "A very good cloud variant. Less maximalist than high, but still has readable layers, nice jellyfish, seabed, bubbles, and parallax.",
    code: "Good object state, stable animation, and solid responsive behavior. It feels more professional than many longer local outputs.",
    ux: "More ambient visual experience than controllable scene."
  },
  chatgpt_5_5_high: {
    summary: "A visually strong result with good glow and atmosphere. The weakness is randomization inside drawing, which can make tentacles shimmer between frames.",
    code: "It works, but some properties should be stable object state rather than freshly randomized in every draw cycle.",
    ux: "Decent mouse glow and good fullscreen treatment."
  },
  sonnet_5: {
    summary: "A clean and correct cloud output. It includes particles, bubbles, rays, nice jellyfish bodies, and a stable structure.",
    code: "Readable object-oriented code. Less ambitious, but without major risks.",
    ux: "No interface elements; it focuses on the scene."
  },
  qwen_36_30b_a3b_q8_xhigh: {
    summary: "A stable colorful scene with decent layering. It is not the most original, but it follows the prompt reliably.",
    code: "Solid classes and effects, although some visual properties are too random.",
    ux: "No meaningful UI."
  },
  gemini_3_8_flash: {
    summary: "The best Gemini output. Good pulsing, strong glow, and more natural tentacles, but fewer layers and no UI.",
    code: "Simple, clean, and runnable. Missing DPR and richer scene systems.",
    ux: "Pure animation without controls."
  },
  muse_glimmer_30b_q8_k_xl: {
    summary: "Shorter code, but a pleasant colorful scene with plankton and bubbles.",
    code: "Simple implementation without deep architecture. It works, but lacks the technical depth of the top outputs.",
    ux: "No UI."
  },
  gemini_3_5_flash_lite: {
    summary: "A simple, colorful, and functional output. Good for a Lite model, but still far from the depth of the strongest scenes.",
    code: "Readable and stable, without runtime errors. Technically conservative.",
    ux: "No interaction."
  },
  opus_5: {
    summary: "Interesting as an embeddable widget rather than a full-screen scene. It includes Pause, Add jellyfish, and click-to-add behavior.",
    code: "Compact and functional, with DPR support. The smaller scene limits the visual impact.",
    ux: "Good simple controls, but the composition is smaller and less immersive."
  },
  gemma4_31b_q4km: {
    summary: "Functional and pleasant, but more basic. It has particles and colorful jellyfish, not strong scene direction.",
    code: "Simple classes and gradients. No serious issues.",
    ux: "No interaction."
  },
  gemini_3_1_pro: {
    summary: "Stable but conservative. In this test, it is weaker than Gemini Flash.",
    code: "Runs, but some tentacle lengths are generated in the draw cycle, which can create visual noise.",
    ux: "No UI and no significant interaction."
  },
  qwen35_9b_q8: {
    summary: "Follows the prompt, but feels like a generic canvas demo with ellipses and bubbles.",
    code: "Simple and readable, without much ambition.",
    ux: "No UI."
  },
  gpt_oss_20b_f16: {
    summary: "Technically clean and brief, but visually very basic.",
    code: "Has a Jellyfish class and a simple loop, but almost no scene complexity.",
    ux: "No UI."
  },
  haiku_4_5: {
    summary: "More of a quick sketch than a finished scene. Pleasant, but weak in comparison.",
    code: "Functional, simple, fixed canvas.",
    ux: "No UI."
  },
  qwen35_9b_bf16: {
    summary: "More ambitious than Q8, but motion and tentacle form are less natural.",
    code: "Radial tentacles and strong positional shifts can make it feel more like a sea anemone than a jellyfish.",
    ux: "No UI."
  }
};

function badge(model) {
  const cls = model.status === "OK"
    ? model.type === "Lokálny" ? "local" : "cloud"
    : "error";
  return `<span class="badge ${cls}">${model.status === "OK" ? typeLabel(model) : model.status}</span>`;
}

function averageScore(model) {
  const values = Object.values(model.scores);
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function actionLinks(model) {
  return `
    <div class="card-actions">
      <a class="button-link small primary" href="${modelUrl(model)}"><span data-i18n="en">Large preview</span><span data-i18n="sk">Veľký náhľad</span></a>
      <a class="button-link small" href="${model.file}" target="_blank" rel="noopener"><span data-i18n="en">Open HTML</span><span data-i18n="sk">Otvoriť HTML</span></a>
    </div>
  `;
}

function renderFeatured() {
  const root = document.getElementById("featuredPreviews");
  const models = featuredIds
    .map(id => state.models.find(model => model.id === id))
    .filter(Boolean);

  root.innerHTML = models.map(model => `
    <article class="preview-card">
      <div class="preview-head">
        <div class="preview-title">#${model.rank} ${model.name}</div>
        ${badge(model)}
      </div>
      <iframe
        class="preview-frame"
        src="${model.file}"
        title="Živý náhľad: ${model.name}"
        loading="lazy"
        sandbox="allow-scripts"
      ></iframe>
      ${actionLinks(model)}
      <p class="preview-caption" data-i18n="en">${englishCopy[model.id]?.summary ?? model.summary}</p>
      <p class="preview-caption" data-i18n="sk">${model.summary}</p>
    </article>
  `).join("");
}

function renderRanking() {
  const rows = document.getElementById("rankingRows");
  const filtered = state.models
    .filter(model => state.filter === "all" || model.type === state.filter)
    .sort(byRank);

  rows.innerHTML = filtered.map(model => `
    <tr>
      <td><strong>${model.rank}</strong></td>
      <td>
        <strong>${model.name}</strong>
        <br><span class="dim">${model.tags.slice(0, 2).join(" · ")}</span>
      </td>
      <td>${badge(model)}</td>
      <td><span class="score">${model.scores.visual}</span></td>
      <td><span class="score">${model.scores.code}</span></td>
      <td><span class="score">${model.scores.animation}</span></td>
      <td><span class="score">${model.scores.ux}</span></td>
      <td><span class="score">${model.scores.responsiveness}</span></td>
      <td>${model.status}</td>
    </tr>
  `).join("");
}

function renderCards() {
  const root = document.getElementById("modelCards");
  root.innerHTML = state.models.sort(byRank).map(model => `
    <article class="model-card" data-type="${model.type}">
      <div class="model-meta">
        <div>
          <h3 class="model-name">${model.name}</h3>
          <p class="dim">${typeLabel(model)} · <span data-i18n="en">average</span><span data-i18n="sk">priemer</span> ${averageScore(model).toFixed(1)}/10</p>
        </div>
        <div class="rank">#${model.rank}</div>
      </div>
      <div class="tags">
        ${model.tags.map(tag => `<span class="tag">${tag}</span>`).join("")}
      </div>
      <div class="model-copy">
        <div class="score-strip">
          <span>Visual ${model.scores.visual}</span>
          <span>Code ${model.scores.code}</span>
          <span>Motion ${model.scores.animation}</span>
          <span>UX ${model.scores.ux}</span>
          <span><span data-i18n="en">Responsive</span><span data-i18n="sk">Responzivita</span> ${model.scores.responsiveness}</span>
        </div>
        <p data-i18n="en">${englishCopy[model.id]?.summary ?? model.summary}</p>
        <p data-i18n="sk">${model.summary}</p>
        <p data-i18n="en"><span class="note-title">Code:</span> ${englishCopy[model.id]?.code ?? model.codeNote}</p>
        <p data-i18n="sk"><span class="note-title">Kód:</span> ${model.codeNote}</p>
        <p data-i18n="en"><span class="note-title">UX/UI:</span> ${englishCopy[model.id]?.ux ?? model.uxNote}</p>
        <p data-i18n="sk"><span class="note-title">UX/UI:</span> ${model.uxNote}</p>
        <p data-i18n="en"><span class="note-title">Responsiveness:</span> ${model.responsiveNoteEn ?? model.responsiveNote}</p>
        <p data-i18n="sk"><span class="note-title">Responzivita:</span> ${model.responsiveNote}</p>
      </div>
      ${actionLinks(model)}
    </article>
  `).join("");
}

function renderMethodology(data) {
  const root = document.getElementById("methodologyList");
  root.innerHTML = data.methodology.map((item, index) => `
    <li>
      ${item}
      <p data-i18n="sk">${data.methodologySk?.[index] ?? ""}</p>
    </li>
  `).join("");
}

function bindFilters() {
  document.querySelectorAll(".filter").forEach(button => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter;
      document.querySelectorAll(".filter").forEach(item => item.classList.remove("is-active"));
      button.classList.add("is-active");
      renderRanking();

      document.querySelectorAll(".model-card").forEach(card => {
        const visible = state.filter === "all" || card.dataset.type === state.filter;
        card.classList.toggle("is-hidden", !visible);
      });
    });
  });
}

async function init() {
  let data = window.MODELS_DATA;
  if (!data) {
    const response = await fetch("data/models.json");
    if (!response.ok) throw new Error("Nepodarilo sa načítať data/models.json");
    data = await response.json();
  }
  state.models = data.models;

  renderFeatured();
  renderRanking();
  renderCards();
  renderMethodology(data);
  bindFilters();
}

init().catch(error => {
  document.body.insertAdjacentHTML(
    "afterbegin",
    `<div style="padding:16px;background:#4a1018;color:#fff">${error.message}</div>`
  );
});
