const scoreLabels = {
  visual: "Visual",
  code: "Code",
  animation: "Animation",
  creativity: "Creativity",
  ux: "UX/UI",
  performance: "Performance",
  responsiveness: "Responsive"
};

const state = {
  data: null,
  votes: { totals: {}, userVote: null, authenticated: false },
  galleryFilter: "all"
};

const byRank = (a, b) => a.rank - b.rank;
const typeLabel = model => model.type === "Lokálny"
  ? `<span data-i18n="en">Local</span><span data-i18n="sk">Lokálny</span>`
  : "Cloud";
const averageScore = model => {
  const values = Object.values(model.scores);
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

function badge(model) {
  if (model.status && model.status !== "OK") {
    return `<span class="badge error">${model.status}</span>`;
  }
  const cls = model.type === "Lokálny" ? "local" : "cloud";
  return `<span class="badge ${cls}">${typeLabel(model)}</span>`;
}

function actionLinks(model) {
  return `
    <div class="card-actions">
      <a class="button-link small primary" href="viewer.html?model=${encodeURIComponent(model.id)}"><span data-i18n="en">Large preview</span><span data-i18n="sk">Veľký náhľad</span></a>
      <a class="button-link small" href="${model.file}" target="_blank" rel="noopener"><span data-i18n="en">Open HTML</span><span data-i18n="sk">Otvoriť HTML</span></a>
      ${model.rank ? `<a class="button-link small" href="compare.html?left=${encodeURIComponent(model.id)}"><span data-i18n="en">Compare</span><span data-i18n="sk">Porovnať</span></a>` : ""}
    </div>
  `;
}

function scoreStrip(model) {
  return `
    <div class="score-strip">
      <span>Visual ${model.scores.visual}</span>
      <span>Code ${model.scores.code}</span>
      <span>Motion ${model.scores.animation}</span>
      <span>UX ${model.scores.ux}</span>
      <span><span data-i18n="en">Responsive</span><span data-i18n="sk">Responzivita</span> ${model.scores.responsiveness}</span>
    </div>
  `;
}

function scoreBars(model, other) {
  return Object.entries(scoreLabels).map(([key, label]) => {
    const value = model.scores[key];
    const delta = other ? value - other.scores[key] : 0;
    const deltaText = delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : "0";
    const deltaClass = delta > 0 ? "win" : delta < 0 ? "lose" : "";
    return `
      <div class="score-bar">
        <div>
          <span>${label}</span>
          <strong>${value}/10</strong>
          ${other ? `<em class="${deltaClass}">${deltaText}</em>` : ""}
        </div>
        <meter min="0" max="10" value="${value}">${value}/10</meter>
      </div>
    `;
  }).join("");
}

function voteButton(model) {
  if (!model.rank) return "";
  const count = state.votes.totals?.[model.id] ?? 0;
  const selected = state.votes.userVote === model.id;
  const disabled = !state.votes.authenticated ? "disabled" : "";
  return `
    <div class="vote-card" data-vote-card="${model.id}">
      <button class="vote-button ${selected ? "is-selected" : ""}" data-vote="${model.id}" ${disabled}>
        <span data-i18n="en">${selected ? "Your vote" : "Vote"}</span><span data-i18n="sk">${selected ? "Tvoj hlas" : "Hlasovať"}</span>
      </button>
      <span><span data-i18n="en">${count} ${count === 1 ? "vote" : "votes"}</span><span data-i18n="sk">${count} hlasov</span></span>
    </div>
  `;
}

function galleryCard(model) {
  return `
    <article class="gallery-card" data-type="${model.type}">
      <div class="preview-head">
        <div class="preview-title">${model.rank ? `#${model.rank} ` : ""}${model.name}</div>
        ${badge(model)}
      </div>
      <iframe class="preview-frame tall" src="${model.file}" title="HTML preview: ${model.name}" loading="lazy" sandbox="allow-scripts"></iframe>
      <div class="gallery-card-body">
        ${model.scores ? scoreStrip(model) : ""}
        <p>${model.summary ?? ""}</p>
        ${model.responsiveNoteEn ? `<p data-i18n="en"><span class="note-title">Responsiveness:</span> ${model.responsiveNoteEn}</p>` : ""}
        ${model.responsiveNote ? `<p data-i18n="sk"><span class="note-title">Responzivita:</span> ${model.responsiveNote}</p>` : ""}
        ${voteButton(model)}
        ${actionLinks(model)}
      </div>
    </article>
  `;
}

async function loadVotes() {
  try {
    const response = await fetch("/api/votes", { headers: { accept: "application/json" } });
    if (!response.ok) throw new Error("Vote endpoint unavailable");
    state.votes = await response.json();
  } catch {
    state.votes = { totals: {}, userVote: null, authenticated: false, localOnly: true };
  }
}

function renderVoteStatus() {
  const root = document.getElementById("voteStatus");
  if (!root) return;
  if (state.votes.localOnly) {
    root.innerHTML = `<span data-i18n="en">Voting is active on the deployed site. Local preview shows the interface without saving votes.</span><span data-i18n="sk">Hlasovanie je aktívne na publikovanej stránke. Lokálny náhľad ukazuje rozhranie bez ukladania hlasov.</span>`;
    return;
  }
  root.innerHTML = state.votes.authenticated
    ? `<span data-i18n="en">You are signed in. Choosing a model stores one server-side vote for your user account; voting again changes it.</span><span data-i18n="sk">Si prihlásený. Výber modelu uloží jeden serverový hlas pre tvoj účet; ďalšie hlasovanie ho zmení.</span>`
    : `<span data-i18n="en">Sign in through the deployed site to vote. Anonymous visitors can browse results but cannot cast a vote.</span><span data-i18n="sk">Na hlasovanie sa prihlás cez publikovanú stránku. Anonymní návštevníci môžu pozerať výsledky, ale nemôžu hlasovať.</span>`;
}

function renderGallery() {
  const root = document.getElementById("galleryGrid");
  if (!root) return;
  const models = state.data.models
    .filter(model => state.galleryFilter === "all" || model.type === state.galleryFilter)
    .sort(byRank);
  root.innerHTML = models.map(model => galleryCard(model)).join("");

  bindVotes();
}

function bindGalleryFilters() {
  document.querySelectorAll("[data-gallery-filter]").forEach(button => {
    button.addEventListener("click", () => {
      state.galleryFilter = button.dataset.galleryFilter;
      document.querySelectorAll("[data-gallery-filter]").forEach(item => item.classList.remove("is-active"));
      button.classList.add("is-active");
      renderGallery();
    });
  });
}

function bindVotes() {
  document.querySelectorAll("[data-vote]").forEach(button => {
    button.addEventListener("click", async () => {
      const modelId = button.dataset.vote;
      button.disabled = true;
      button.textContent = "Saving...";
      try {
        const response = await fetch("/api/vote", {
          method: "POST",
          headers: { "content-type": "application/json", accept: "application/json" },
          body: JSON.stringify({ modelId })
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || "Vote failed");
        state.votes = payload;
        renderVoteStatus();
        renderGallery();
      } catch (error) {
        button.textContent = error.message;
        setTimeout(renderGallery, 1500);
      }
    });
  });
}

function renderComparePanel(model, other, side) {
  return `
    <article class="compare-panel">
      <div class="preview-head">
        <div class="preview-title">#${model.rank} ${model.name}</div>
        ${badge(model)}
      </div>
      <iframe class="compare-frame" src="${model.file}" title="${side} preview: ${model.name}" sandbox="allow-scripts"></iframe>
      <div class="compare-body">
        <p class="dim"><span data-i18n="en">Average</span><span data-i18n="sk">Priemer</span> ${averageScore(model).toFixed(1)}/10</p>
        ${scoreBars(model, other)}
        <p>${model.summary}</p>
        <p><span class="note-title">Code:</span> ${model.codeNote}</p>
        <p><span class="note-title">UX/UI:</span> ${model.uxNote}</p>
        <p data-i18n="en"><span class="note-title">Responsiveness:</span> ${model.responsiveNoteEn ?? model.responsiveNote}</p>
        <p data-i18n="sk"><span class="note-title">Responzivita:</span> ${model.responsiveNote}</p>
        ${actionLinks(model)}
      </div>
    </article>
  `;
}

function selectOptions(selectedId) {
  return state.data.models.sort(byRank).map(model => `
    <option value="${model.id}" ${model.id === selectedId ? "selected" : ""}>#${model.rank} ${model.name}</option>
  `).join("");
}

function renderCompare() {
  const root = document.getElementById("headGrid");
  if (!root) return;
  const params = new URLSearchParams(location.search);
  const leftDefault = params.get("left") || "qwen38_27b_q8";
  const rightDefault = params.get("right") || (leftDefault === "glm_53_iq4_xs" ? "chatgpt_5_6_sol_high" : "glm_53_iq4_xs");
  const leftSelect = document.getElementById("leftSelect");
  const rightSelect = document.getElementById("rightSelect");

  leftSelect.innerHTML = selectOptions(leftDefault);
  rightSelect.innerHTML = selectOptions(rightDefault);

  function update() {
    const left = state.data.models.find(model => model.id === leftSelect.value) ?? state.data.models[0];
    const right = state.data.models.find(model => model.id === rightSelect.value) ?? state.data.models[1];
    root.innerHTML = renderComparePanel(left, right, "Left") + renderComparePanel(right, left, "Right");
    const next = new URLSearchParams({ left: left.id, right: right.id });
    history.replaceState(null, "", `${location.pathname}?${next.toString()}`);
  }

  leftSelect.addEventListener("change", update);
  rightSelect.addEventListener("change", update);
  update();
}

function renderViewer() {
  const frame = document.getElementById("viewerFrame");
  if (!frame) return;
  const params = new URLSearchParams(location.search);
  const requested = params.get("model") || "qwen38_27b_q8";
  const model = state.data.models.find(item => item.id === requested) ?? state.data.models[0];
  document.title = `${model.name} | Large preview`;
  document.getElementById("viewerTitle").textContent = model.name;
  document.getElementById("viewerMeta").innerHTML = model.rank
    ? `#${model.rank} · ${typeLabel(model)} · responsive ${model.scores.responsiveness}/10`
    : "";
  document.getElementById("viewerSource").href = model.file;
  document.getElementById("viewerCompare").href = model.rank
    ? `compare.html?left=${encodeURIComponent(model.id)}`
    : "gallery.html";
  frame.src = model.file;
}

async function init() {
  state.data = window.MODELS_DATA;
  if (!state.data) {
    const response = await fetch("data/models.json");
    if (!response.ok) throw new Error("Unable to load model data");
    state.data = await response.json();
  }
  await loadVotes();
  renderVoteStatus();
  renderGallery();
  bindGalleryFilters();
  renderCompare();
  renderViewer();
}

init().catch(error => {
  document.body.insertAdjacentHTML(
    "afterbegin",
    `<div style="padding:16px;background:#4a1018;color:#fff">${error.message}</div>`
  );
});
