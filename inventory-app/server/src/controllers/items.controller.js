import {
  readAllItems,
  readItemById,
  createNewItem,
  updateExistingItem,
  deleteExistingItem,
} from "../services/items.service.js";
import { validateItemPayload } from "../validators/item.validator.js";

export async function getAllItems(req, res, next) {
  try {
    const items = await readAllItems();
    res.json(items);
  } catch (err) {
    next(err);
  }
}

export async function getItemById(req, res, next) {
  try {
    const item = await readItemById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: { message: "Item not found" } });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function createItem(req, res, next) {
  try {
    const { valid, errors } = await validateItemPayload(req.body, {
      isUpdate: false,
    });
    if (!valid) {
      return res.status(400).json({ error: { message: "Validation error", details: errors } });
    }
    const newItem = await createNewItem(req.body);
    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
}

export async function updateItem(req, res, next) {
  try {
    const { valid, errors } = await validateItemPayload(req.body, {
      isUpdate: true,
      id: req.params.id,
    });
    if (!valid) {
      return res.status(400).json({ error: { message: "Validation error", details: errors } });
    }
    const updated = await updateExistingItem(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: { message: "Item not found" } });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteItem(req, res, next) {
  try {
    const deleted = await deleteExistingItem(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: { message: "Item not found" } });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
