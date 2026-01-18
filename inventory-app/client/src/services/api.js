// This module is currently a no-op stub.
// The app now stores inventory entirely in
// browser localStorage via useInventory,
// so no network calls are required.

export async function fetchItems() {
  return [];
}

export async function createItem(payload) {
  return { ...payload };
}

export async function updateItem(id, payload) {
  return { id, ...payload };
}

export async function deleteItem(id) {
  return;
}
