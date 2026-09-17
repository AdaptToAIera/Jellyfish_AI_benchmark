# AI Jellyfish Benchmark

This is a data-driven web article for benchmarking local and cloud AI models on the prompt. Visitors can switch between English and Slovak, and the page remembers their language and light/dark scene preference.

`create a colorful animated deep sea scene with glowing jellyfish using HTML canvas`

## How to add a new model

1. Copy the new HTML output into `models/`.
2. Add a new record to `data/models.json`.
3. Fill `id`, `name`, `type`, `file`, `rank`, `scores`, `status`, `tags`, `summary`, `codeNote`, `uxNote`, and `responsiveNote`.
4. If the model should appear in the large live previews, add its `id` to `featuredIds` in `app.js`.

The page automatically generates the table, detail cards, filtering, live previews, gallery, large preview route, and head-to-head comparison.

## Voting

The deployed site uses a server-side D1 table. The vote API reads the signed-in OpenAI user ID from platform headers and stores one active vote per user. A later vote replaces the previous one instead of adding a duplicate.

## Local preview

Run a static server in this folder and open `index.html` through HTTP. Direct `file://` opening may block `data/models.json`. Voting saves only on the deployed Sites version because it needs authenticated platform headers and D1.

## Build

`npm run build` creates a Cloudflare Worker-compatible artifact in `dist/`. It embeds the article pages, model HTML files, and vote API into `dist/server/index.js`.