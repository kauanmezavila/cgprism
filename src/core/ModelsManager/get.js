import Database from "better-sqlite3";

const db = new Database("src/data/registry.db");

export function getModels() {
  const stmt = db.prepare(`
    SELECT *
    FROM models
  `);

  return stmt.all();
}

export function getModelsProvider(provider) {
  const stmt = db.prepare(`
    SELECT *
    FROM models
    WHERE provider = @provider
  `);

  return stmt.all({ provider });
}

export function getModelsName(name) {
  const stmt = db.prepare(`
    SELECT *
    FROM models
    WHERE name = @name
  `);

  return stmt.all({ name });
}

export function getModelsOwner(owner) {
  const stmt = db.prepare(`
    SELECT *
    FROM models
    WHERE owner = @owner
  `);

  return stmt.all({ owner });
}

export function getModelsFormat(format) {
  const stmt = db.prepare(`
    SELECT *
    FROM models
    WHERE format = @format
  `);

  return stmt.all({ format });
}

export function getModelsRuntime(runtime) {
  const stmt = db.prepare(`
    SELECT *
    FROM models
    WHERE runtime = @runtime
  `);

  return stmt.all({ runtime });
}

export function getModelsStatus(status) {
  const stmt = db.prepare(`
    SELECT *
    FROM models
    WHERE status = @status
  `);

  return stmt.all({ status });
}

export function getModelsParams(parameters) {
  const stmt = db.prepare(`
    SELECT *
    FROM models
    WHERE parameters = @parameters
  `);

  return stmt.all({ parameters });
}

export function getModelsId(id) {
  const stmt = db.prepare(`
    SELECT *
    FROM models
    WHERE id = @id
  `);

  return stmt.all({ id });
}
