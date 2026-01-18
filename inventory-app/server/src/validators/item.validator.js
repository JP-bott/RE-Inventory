import { readAllItems } from "../services/items.service.js";

const ALLOWED_CATEGORIES = ["monitor", "pc", "ups", "keyboard", "mouse"];

export async function validateItemPayload(payload, { isUpdate, id } = {}) {
  const errors = [];

  const serial = typeof payload.serialNumber === "string" ? payload.serialNumber.trim() : "";
  if (!serial) {
    errors.push("Serial number is required.");
  }

  const category = payload.category;
  if (!ALLOWED_CATEGORIES.includes(category)) {
    errors.push("Category must be one of: monitor, pc, ups, keyboard, mouse.");
  }

  if (payload.name !== undefined && typeof payload.name !== "string") {
    errors.push("Name must be a string if provided.");
  }

  if (payload.description !== undefined && typeof payload.description !== "string") {
    errors.push("Description must be a string if provided.");
  }

  if (serial) {
    const items = await readAllItems();
    const duplicate = items.find(
      (item) =>
        item.serialNumber.toLowerCase() === serial.toLowerCase() &&
        (!isUpdate || item.id !== id)
    );
    if (duplicate) {
      errors.push("An item with this serial number already exists.");
    }
  }

  return { valid: errors.length === 0, errors };
}
