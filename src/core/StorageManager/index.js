import Database from "better-sqlite3";
import { storageDatabasePath } from "../Packages/paths.js";

const db = new Database(storageDatabasePath);

export function initStorage() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS command_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      command TEXT NOT NULL,
      executed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export function saveCommand(command) {
  if (typeof command !== "string" || !command.trim()) return;
  return db
    .prepare("INSERT INTO command_history (command) VALUES (?)")
    .run(command.trim());
}

export function getCommandHistory(limit = 100) {
  const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 100;
  return db
    .prepare(
      "SELECT id, command, executed_at FROM command_history ORDER BY id DESC LIMIT ?",
    )
    .all(safeLimit);
}
