import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import xml2js from 'xml2js';

const { parseStringPromise, Builder } = xml2js;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataFilePath = path.join(__dirname, '..', '..', 'data', 'inventory.xml');

let lock = Promise.resolve();

async function withLock(fn) {
  const currentLock = lock;
  let release;
  lock = new Promise((resolve) => (release = resolve));
  await currentLock;
  try {
    return await fn();
  } finally {
    release();
  }
}

async function ensureFileExists() {
  try {
    await fs.access(dataFilePath);
  } catch {
    const initialXml = '<?xml version="1.0" encoding="UTF-8"?><inventory></inventory>';
    await fs.writeFile(dataFilePath, initialXml, 'utf-8');
  }
}

export async function readInventory() {
  return withLock(async () => {
    await ensureFileExists();
    const xml = await fs.readFile(dataFilePath, 'utf-8');
    const result = await parseStringPromise(xml, { explicitArray: false, trim: true });

    const itemsRaw = result.inventory && result.inventory.item
      ? Array.isArray(result.inventory.item)
        ? result.inventory.item
        : [result.inventory.item]
      : [];

    const items = itemsRaw.map((item) => ({
      id: item.id,
      serialNumber: item.serialNumber,
      category: item.category,
      name: item.name || '',
      description: item.description || '',
    }));

    return { items };
  });
}

export async function writeInventory(inventory) {
  return withLock(async () => {
    const builder = new Builder({ rootName: 'inventory', xmldec: { version: '1.0', encoding: 'UTF-8' } });

    const itemsForXml = inventory.items.map((item) => ({
      id: item.id,
      serialNumber: item.serialNumber,
      category: item.category,
      name: item.name || '',
      description: item.description || '',
    }));

    const xmlObj = {
      item: itemsForXml,
    };

    const xml = builder.buildObject(xmlObj);
    await fs.writeFile(dataFilePath, xml, 'utf-8');
  });
}
