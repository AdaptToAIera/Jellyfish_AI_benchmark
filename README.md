# AI Jellyfish Benchmark

This is a data-driven web article for benchmarking local and cloud AI models on the prompt. Visitors can switch between English and Slovak, and the page remembers their language and light/dark scene preference.

Toto je dátovo riadený webový článok k benchmarku lokálnych a cloudových AI modelov na prompte. Návštevník si môže prepínať angličtinu/slovenčinu aj svetlú/tmavú scénu a stránka si voľbu zapamätá.

`create a colourful animated deep sea scene with glowing jellyfish using HTML canvas`

## How to add a new model / Ako pridať nový model

1. Copy the new HTML output into `models/`.
2. Add a new record to `data/models.json`.
3. Fill `id`, `name`, `type`, `file`, `rank`, `scores`, `status`, `tags`, `summary`, `codeNote`, `uxNote`, and `responsiveNote`.
4. If the model should appear in the large live previews, add its `id` to `featuredIds` in `app.js`.

Slovensky:

1. Skopíruj nový HTML výstup do priečinka `models/`.
2. Pridaj nový záznam do `data/models.json`.
3. Vyplň `id`, `name`, `type`, `file`, `rank`, `scores`, `status`, `tags`, `summary`, `codeNote`, `uxNote` a `responsiveNote`.
4. Ak chceš nový model ukázať medzi veľkými live preview ukážkami, pridaj jeho `id` do `featuredIds` v `app.js`.

The page automatically generates the table, detail cards, filtering, live previews, gallery, large preview route, and head-to-head comparison.

Stránka automaticky vygeneruje tabuľku, detailné karty, filtrovanie, živé náhľady, galériu, veľký náhľad a head-to-head porovnanie.

## Voting / Hlasovanie

The deployed site uses a server-side D1 table. The vote API reads the signed-in OpenAI user ID from platform headers and stores one active vote per user. A later vote replaces the previous one instead of adding a duplicate.

Publikovaná stránka používa serverovú D1 tabuľku. Hlasovacie API číta ID prihláseného OpenAI používateľa z platformových hlavičiek a ukladá jeden aktívny hlas na používateľa. Neskorší hlas prepíše predchádzajúci namiesto pridania duplicity.

## Local preview / Lokálne spustenie

Run a static server in this folder and open `index.html` through HTTP. Direct `file://` opening may block `data/models.json`. Voting saves only on the deployed Sites version because it needs authenticated platform headers and D1.

Spusti statický server v tomto priečinku a otvor `index.html` cez HTTP. Pri priamom otvorení súboru môže prehliadač blokovať načítanie `data/models.json`. Hlasovanie sa ukladá iba na publikovanej Sites verzii, pretože potrebuje autentifikačné hlavičky platformy a D1.

## Build / Zostavenie

`npm run build` creates a Cloudflare Worker-compatible artifact in `dist/`. It embeds the article pages, model HTML files, and vote API into `dist/server/index.js`.

`npm run build` vytvorí Cloudflare Worker kompatibilný artefakt v `dist/`. Do `dist/server/index.js` vloží článok, HTML výstupy modelov aj hlasovacie API.
