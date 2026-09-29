import Database from "better-sqlite3";

const db = new Database("src/data/registry.db");

export function updateModelsProvider(id, provider) {
  const stmt = db.prepare(`
    UPDATE models
    SET provider = @provider
    WHERE id = @id
  `);

  return stmt.all({ id, provider });
}

export function updateModelsName(id, name) {
  const stmt = db.prepare(`
    UPDATE models
    SET name = @name
    WHERE id = @id 
  `);

  return stmt.all({ id, name });
}

export function updateModelsOwner(id, owner) {
  const stmt = db.prepare(`
    UPDATE models
    SET owner = @owner
    WHERE id = @id 
  `);

  return stmt.all({ id, owner });
}

export function updateModelsFormat(id, format) {
  const stmt = db.prepare(`
    UPDATE models
    SET format = @format
    WHERE id = @id
  `);

  return stmt.all({ id, format });
}

export function updateModelsRuntime(id, runtime) {
  const stmt = db.prepare(`
    UPDATE models
    SET runtime = @runtime
    WHERE id = @id
  `);

  return stmt.all({ id, runtime });
}

export function updateModelsStatus(id, status) {
  const stmt = db.prepare(`
    UPDATE models
    SET status = @status
    WHERE id = @id
  `);

  return stmt.all({ id, status });
}

export function updateModelsParams(id, parameters) {
  const stmt = db.prepare(`
    UPDATE models
    SET parameters = @parameters
    WHERE id = @id
  `);

  return stmt.all({ id, parameters });
}
