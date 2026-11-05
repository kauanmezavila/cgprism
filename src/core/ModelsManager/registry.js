import Database from "better-sqlite3";

const db = new Database("src/data/registry.db");

export function dbInit() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS models (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      family TEXT,
      architecture TEXT,
      version TEXT,
      provider TEXT,
      owner TEXT,
      path TEXT NOT NULL,
      format TEXT NOT NULL,
      size_bytes INTEGER,
      parameters TEXT,
      quantization TEXT,
      runtime TEXT,
      context_length INTEGER,
      capabilities TEXT,
      gls INTEGER,
      status TEXT NOT NULL DEFAULT 'installed',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const columns = new Set(
    db.pragma("table_info(models)").map(({ name }) => name),
  );
  for (const [name, type] of [
    ["family", "TEXT"],
    ["architecture", "TEXT"],
    ["quantization", "TEXT"],
    ["context_length", "INTEGER"],
    ["capabilities", "TEXT"],
  ]) {
    if (!columns.has(name))
      db.exec(`ALTER TABLE models ADD COLUMN ${name} ${type}`);
  }
}

export function addModel(model) {
  const stmt = db.prepare(`
    INSERT INTO models (
      name,
      family,
      architecture,
      version,
      provider,
      owner,
      path,
      format,
      size_bytes,
      parameters,
      quantization,
      runtime,
      context_length,
      capabilities,
      gls
    )
    VALUES (
      @name,
      @family,
      @architecture,
      @version,
      @provider,
      @owner,
      @path,
      @format,
      @size_bytes,
      @parameters,
      @quantization,
      @runtime,
      @context_length,
      @capabilities,
      @gls
    )
  `);

  return stmt.run(model);
}
