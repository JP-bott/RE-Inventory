import axios from "axios";

// Use a relative base URL by default so the app works
// on any host (desktop, mobile, Vercel). For local
// development, CRA's proxy will forward /api to the
// Express server on localhost:4000. In production,
// you can override this with REACT_APP_API_BASE.
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || "/api",
});

export async function fetchItems() {
  const res = await api.get("/items");
  return res.data;
}

export async function createItem(payload) {
  const res = await api.post("/items", payload);
  return res.data;
}

export async function updateItem(id, payload) {
  const res = await api.put(`/items/${id}`, payload);
  return res.data;
}

export async function deleteItem(id) {
  await api.delete(`/items/${id}`);
}
