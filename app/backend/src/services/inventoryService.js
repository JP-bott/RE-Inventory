import { v4 as uuidv4 } from 'uuid';
import { readInventory, writeInventory } from './xmlStore.js';

const VALID_CATEGORIES = ['monitor', 'pc', 'ups', 'keyboard', 'mouse'];

function validateItemPayload(data, existingItems, idBeingUpdated = null) {
  const errors = [];
  const { serialNumber, category, name, description } = data;

  if (!serialNumber || typeof serialNumber !== 'string' || !serialNumber.trim()) {
    errors.push('Serial number is required.');
  }

  if (!category || !VALID_CATEGORIES.includes(category.toLowerCase())) {
    errors.push('Category must be one of: monitor, pc, ups, keyboard, mouse.');
  }

  if (name != null && typeof name !== 'string') {
    errors.push('Name must be a string.');
  }

  if (description != null && typeof description !== 'string') {
    errors.push('Description must be a string.');
  }

  if (serialNumber) {
    const normalizedSerial = serialNumber.trim().toLowerCase();
    const duplicate = existingItems.find(
      (item) =>
        item.serialNumber.trim().toLowerCase() === normalizedSerial &&
        item.id !== idBeingUpdated
    );
    if (duplicate) {
      errors.push('Serial number must be unique across all items.');
    }
  }

  return errors;
}

export async function getAllItems() {
  const inventory = await readInventory();
  return inventory.items;
}

export async function getItemById(id) {
  const inventory = await readInventory();
  return inventory.items.find((item) => item.id === id) || null;
}

export async function createItem(data) {
  const inventory = await readInventory();
  const errors = validateItemPayload(data, inventory.items);

  if (errors.length > 0) {
    const error = new Error(errors.join(' '));
    error.status = 400;
    throw error;
  }

  const newItem = {
    id: uuidv4(),
    serialNumber: data.serialNumber.trim(),
    category: data.category.toLowerCase(),
    name: data.name?.trim() || '',
    description: data.description?.trim() || '',
  };

  inventory.items.push(newItem);
  await writeInventory(inventory);

  return newItem;
}

export async function updateItem(id, data) {
  const inventory = await readInventory();
  const index = inventory.items.findIndex((item) => item.id === id);

  if (index === -1) {
    return null;
  }

  const current = inventory.items[index];
  const updatedCandidate = {
    ...current,
    ...data,
  };

  const errors = validateItemPayload(updatedCandidate, inventory.items, id);
  if (errors.length > 0) {
    const error = new Error(errors.join(' '));
    error.status = 400;
    throw error;
  }

  const updated = {
    ...current,
    serialNumber: updatedCandidate.serialNumber.trim(),
    category: updatedCandidate.category.toLowerCase(),
    name: updatedCandidate.name?.trim() || '',
    description: updatedCandidate.description?.trim() || '',
  };

  inventory.items[index] = updated;
  await writeInventory(inventory);

  return updated;
}

export async function deleteItem(id) {
  const inventory = await readInventory();
  const index = inventory.items.findIndex((item) => item.id === id);
  if (index === -1) {
    return false;
  }
  inventory.items.splice(index, 1);
  await writeInventory(inventory);
  return true;
}
