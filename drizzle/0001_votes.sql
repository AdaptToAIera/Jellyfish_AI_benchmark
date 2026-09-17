CREATE TABLE IF NOT EXISTS votes (
  user_id TEXT PRIMARY KEY NOT NULL,
  model_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_votes_model_id ON votes(model_id);

PRAGMA optimize;
