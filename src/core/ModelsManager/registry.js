import Database from "better-sqlite3";

const db = new Database("src/data/registry.db");

db.exec(`
    CREATE TABLE IF NOT EXISTS models (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        provider TEXT,
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
