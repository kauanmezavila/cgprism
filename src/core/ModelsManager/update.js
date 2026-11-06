import Database from "better-sqlite3";

const db = new Database("src/data/registry.db");

export function updateModelsProvider(id, provider) {
  const stmt = db.prepare(`
    UPDATE models
    SET provider = @provider, updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `);

  return stmt.run({ id, provider });
}

export function updateModelsName(id, name) {
  const stmt = db.prepare(`
    UPDATE models
    SET name = @name, updated_at = CURRENT_TIMESTAMP
    WHERE id = @id 
  `);

  return stmt.run({ id, name });
}

export function updateModelsOwner(id, owner) {
  const stmt = db.prepare(`
    UPDATE models
    SET owner = @owner, updated_at = CURRENT_TIMESTAMP
    WHERE id = @id 
  `);

  return stmt.run({ id, owner });
}

export function updateModelsFormat(id, format) {
  const stmt = db.prepare(`
    UPDATE models
    SET format = @format, updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `);

  return stmt.run({ id, format });
}

export function updateModelsRuntime(id, runtime) {
  const stmt = db.prepare(`
    UPDATE models
    SET runtime = @runtime, updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `);

  return stmt.run({ id, runtime });
}

export function updateModelsOllamaId(id, ollama_model_id) {
  const stmt = db.prepare(`
    UPDATE models
    SET ollama_model_id = @ollama_model_id, updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `);

  return stmt.run({ id, ollama_model_id });
}

export function updateModelsStatus(id, status) {
  const stmt = db.prepare(`
    UPDATE models
    SET status = @status, updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `);

  return stmt.run({ id, status });
}

export function updateModelsParams(id, parameters) {
  const stmt = db.prepare(`
    UPDATE models
    SET parameters = @parameters, updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `);

  return stmt.run({ id, parameters });
}

export function updateGLS(id, gls) {
  const stmt = db.prepare(`
    UPDATE models
    SET gls = @gls, updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `);

  return stmt.run({ id, gls });
}

export function updateModelMetadata(
  id,
  { family, architecture, version, quantization, context_length, capabilities },
) {
  return db
    .prepare(
      `
    UPDATE models
    SET family = @family,
        architecture = @architecture,
        version = @version,
        quantization = @quantization,
        context_length = @context_length,
        capabilities = @capabilities,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `,
    )
    .run({
      id,
      family,
      architecture,
      version,
      quantization,
      context_length,
      capabilities,
    });
}
