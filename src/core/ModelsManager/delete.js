import Database from "better-sqlite3";

const db = new Database("src/data/registry.db");

export function deleteModelsProvider(provider) {
  const stmt = db.prepare(`
    DELETE FROM models
    WHERE provider = @provider
  `);

  return stmt.run({ provider });
}

export function deleteModelsName(name, owner) {
  const stmt = db.prepare(`
    DELETE FROM models
    WHERE name = @name
    AND owner = @owner
  `);

  return stmt.run({ name, owner });
}

export function deleteModelsOwner(owner) {
  const stmt = db.prepare(`
    DELETE FROM models
    WHERE owner = @owner
  `);

  return stmt.run({ owner });
}

export function deleteModelsFormat(format) {
  const stmt = db.prepare(`
    DELETE FROM models
    WHERE format = @format
  `);

  return stmt.run({ format });
}

export function deleteModelsRuntime(runtime) {
  const stmt = db.prepare(`
    DELETE FROM models
    WHERE runtime = @runtime
  `);

  return stmt.run({ runtime });
}

export function deleteModelsStatus(status) {
  const stmt = db.prepare(`
    DELETE FROM models
    WHERE status = @status
  `);

  return stmt.run({ status });
}

export function deleteModelsParams(parameters) {
  const stmt = db.prepare(`
    DELETE FROM models
    WHERE parameters = @parameters
  `);

  return stmt.run({ parameters });
}

export function deleteModelsId(id) {
  const stmt = db.prepare(`
    DELETE FROM models
    WHERE id = @id
  `);

  return stmt.run({ id });
}
