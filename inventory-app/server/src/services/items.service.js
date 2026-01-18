import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import { acquireLock, releaseLock } from "../utils/fileLock.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataFilePath = path.join(__dirname, "..", "..", "inventory.json");

async function ensureFileExists() {
  if (!fs.existsSync(dataFilePath)) {
    await fs.promises.writeFile(dataFilePath, "[]", "utf-8");
  }
}

async function readJson() {
  await ensureFileExists();
  const raw = await fs.promises.readFile(dataFilePath, "utf-8");
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // If file is corrupted, reset to empty array instead of crashing.
    return [];
  }
}

async function writeJson(items) {
  await fs.promises.writeFile(
    dataFilePath,
    JSON.stringify(items, null, 2),
    "utf-8"
  );
}

export async function readAllItems() {
  await acquireLock(dataFilePath);
  try {
    return await readJson();
  } finally {
    await releaseLock(dataFilePath);
  }
}

export async function readItemById(id) {
  const items = await readAllItems();
  return items.find((i) => i.id === id) || null;
}

export async function createNewItem(payload) {
  await acquireLock(dataFilePath);
  try {
    const items = await readJson();
    const newItem = {
      id: uuidv4(),
      serialNumber: payload.serialNumber.trim(),
      category: payload.category,
      name: payload.name ?? "",
      description: payload.description ?? "",
    };
    items.push(newItem);
    await writeJson(items);
    return newItem;
  } finally {
    await releaseLock(dataFilePath);
  }
}

export async function updateExistingItem(id, payload) {
  await acquireLock(dataFilePath);
  try {
    const items = await readJson();
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) return null;
    const existing = items[index];
    const updated = {
      ...existing,
      serialNumber: payload.serialNumber.trim(),
      category: payload.category,
      name: payload.name ?? "",
      description: payload.description ?? "",
    };
    items[index] = updated;
    await writeJson(items);
    return updated;
  } finally {
    await releaseLock(dataFilePath);
  }
}

export async function deleteExistingItem(id) {
  await acquireLock(dataFilePath);
  try {
    const items = await readJson();
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) return false;
    items.splice(index, 1);
    await writeJson(items);
    return true;
  } finally {
    await releaseLock(dataFilePath);
  }
}
