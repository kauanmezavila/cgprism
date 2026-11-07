import Database from "better-sqlite3";
import { registryPath } from "../Packages/paths.js";

const db = new Database(registryPath);

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
      parameters REAL,
      quantization TEXT,
      runtime TEXT,
      ollama_model_id TEXT,
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
    ["parameters", "REAL"],
    ["capabilities", "TEXT"],
  ]) {
    if (!columns.has(name))
      db.exec(`ALTER TABLE models ADD COLUMN ${name} ${type}`);
  }

  const parameterColumn = db
    .pragma("table_info(models)")
    .find(({ name }) => name === "parameters");
  if (parameterColumn?.type.toUpperCase() !== "REAL") {
    db.transaction(() => {
      const names = db.pragma("table_info(models)").map(({ name }) => name);
      const quoted = names.map((name) => `\"${name}\"`).join(", ");
      db.exec(`
        CREATE TABLE models_migrated (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL, family TEXT, architecture TEXT, version TEXT,
          provider TEXT, owner TEXT, path TEXT NOT NULL, format TEXT NOT NULL,
          size_bytes INTEGER, parameters REAL, quantization TEXT, runtime TEXT,
          ollama_model_id TEXT, context_length INTEGER, capabilities TEXT,
          gls INTEGER, status TEXT NOT NULL DEFAULT 'installed',
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        INSERT INTO models_migrated (${quoted})
        SELECT ${names
          .map((name) =>
            name === "parameters"
              ? `CASE WHEN upper(trim(parameters)) GLOB '*M' THEN CAST(substr(trim(parameters), 1, length(trim(parameters))-1) AS REAL) / 1000.0 WHEN upper(trim(parameters)) GLOB '*B' THEN CAST(substr(trim(parameters), 1, length(trim(parameters))-1) AS REAL) ELSE CAST(parameters AS REAL) END`
              : `\"${name}\"`,
          )
          .join(", ")}
        FROM models;
        DROP TABLE models;
        ALTER TABLE models_migrated RENAME TO models;
      `);
    })();
  }
}

export function addModel(model) {
  model = { ...model, parameters: normalizeParameters(model.parameters) };
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
      ollama_model_id,
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
      @ollama_model_id,
      @context_length,
      @capabilities,
      @gls
    )
  `);

  return stmt.run(model);
}

export function normalizeParameters(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const match = String(value)
    .trim()
    .match(/^(\d+(?:\.\d+)?)\s*([bm])?$/i);
  if (!match) return null;
  const amount = Number(match[1]);
  return match[2]?.toUpperCase() === "M" ? amount / 1000 : amount;
}
