import Database from "better-sqlite3";

const db = new Database("src/data/registry.db");

export function dbInit() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS models (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      provider TEXT,
      owner TEXT,
      version TEXT,
      path TEXT NOT NULL,
      format TEXT NOT NULL,
      size_bytes INTEGER,
      parameters TEXT,
      runtime TEXT,
      status TEXT NOT NULL DEFAULT 'installed',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export function addModel(model) {
  const stmt = db.prepare(`
    INSERT INTO models (
      name,
      provider,
      owner,
      version,
      path,
      format,
      size_bytes,
      parameters,
      runtime
    )
    VALUES (
      @name,
      @provider,
      @owner,
      @version,
      @path,
      @format,
      @size_bytes,
      @parameters,
      @runtime
    )
  `);

  return stmt.run(model);
}
