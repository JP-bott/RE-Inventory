import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || "http://localhost:4000/api",
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
