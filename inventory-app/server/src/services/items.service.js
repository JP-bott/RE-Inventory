import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parseStringPromise, Builder } from "xml2js";
import { v4 as uuidv4 } from "uuid";
import { acquireLock, releaseLock } from "../utils/fileLock.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataFilePath = path.join(__dirname, "..", "..", "inventory.xml");

async function ensureFileExists() {
  if (!fs.existsSync(dataFilePath)) {
    const builder = new Builder();
    const xml = builder.buildObject({ inventory: { item: [] } });
    fs.writeFileSync(dataFilePath, xml, "utf-8");
  }
}

async function readXml() {
  await ensureFileExists();
  const xml = await fs.promises.readFile(dataFilePath, "utf-8");
  const parsed = await parseStringPromise(xml, { explicitArray: false });
  const items = parsed.inventory && parsed.inventory.item
    ? Array.isArray(parsed.inventory.item)
      ? parsed.inventory.item
      : [parsed.inventory.item]
    : [];
  return items.map(normalizeItem);
}

async function writeXml(items) {
  const builder = new Builder();
  const xml = builder.buildObject({ inventory: { item: items } });
  await fs.promises.writeFile(dataFilePath, xml, "utf-8");
}

function normalizeItem(raw) {
  return {
    id: raw.id,
    serialNumber: raw.serialNumber,
    category: raw.category,
    name: raw.name ?? "",
    description: raw.description ?? "",
  };
}

export async function readAllItems() {
  await acquireLock(dataFilePath);
  try {
    return await readXml();
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
    const items = await readXml();
    const newItem = {
      id: uuidv4(),
      serialNumber: payload.serialNumber.trim(),
      category: payload.category,
      name: payload.name ?? "",
      description: payload.description ?? "",
    };
    items.push(newItem);
    await writeXml(items);
    return newItem;
  } finally {
    await releaseLock(dataFilePath);
  }
}

export async function updateExistingItem(id, payload) {
  await acquireLock(dataFilePath);
  try {
    const items = await readXml();
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
    await writeXml(items);
    return updated;
  } finally {
    await releaseLock(dataFilePath);
  }
}

export async function deleteExistingItem(id) {
  await acquireLock(dataFilePath);
  try {
    const items = await readXml();
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) return false;
    items.splice(index, 1);
    await writeXml(items);
    return true;
  } finally {
    await releaseLock(dataFilePath);
  }
}
