const PREF_KEYS = {
  language: "aiJellyfishBenchmark.language",
  theme: "aiJellyfishBenchmark.theme"
};

const getStoredPreference = (key, fallback) => {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
};

const setStoredPreference = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Browser storage can be unavailable in strict privacy modes. */
  }
};

function applyLanguage(language) {
  const next = language === "sk" ? "sk" : "en";
  document.documentElement.dataset.lang = next;
  document.documentElement.lang = next;
  setStoredPreference(PREF_KEYS.language, next);
  document.querySelectorAll("[data-pref-lang]").forEach(button => {
    button.classList.toggle("is-active", button.dataset.prefLang === next);
    button.setAttribute("aria-pressed", button.dataset.prefLang === next ? "true" : "false");
  });
}

function applyTheme(theme) {
  const next = theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  setStoredPreference(PREF_KEYS.theme, next);
  document.querySelectorAll("[data-pref-theme]").forEach(button => {
    button.classList.toggle("is-active", button.dataset.prefTheme === next);
    button.setAttribute("aria-pressed", button.dataset.prefTheme === next ? "true" : "false");
  });
}

function initPreferences() {
  applyLanguage(getStoredPreference(PREF_KEYS.language, "en"));
  applyTheme(getStoredPreference(PREF_KEYS.theme, "dark"));

  document.querySelectorAll("[data-pref-lang]").forEach(button => {
    button.addEventListener("click", () => applyLanguage(button.dataset.prefLang));
  });
  document.querySelectorAll("[data-pref-theme]").forEach(button => {
    button.addEventListener("click", () => applyTheme(button.dataset.prefTheme));
  });
}

initPreferences();
