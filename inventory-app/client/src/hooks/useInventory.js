import { useEffect, useMemo, useState } from "react";
import {
  fetchItems,
  createItem,
  updateItem,
  deleteItem,
} from "../services/api";

const PAGE_SIZE = 25;

export function useInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchItems();
      // Ensure we always store an array so downstream
      // logic using .filter and .map cannot crash.
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load inventory.");
      showNotification("error", "Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;
      const matchesSearch = !term
        ? true
        : (item.serialNumber || "").toLowerCase().includes(term) ||
          (item.name || "").toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [items, search, categoryFilter]);

  const totalItems = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filteredItems.slice(startIndex, startIndex + PAGE_SIZE);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleSaveItem = async (item) => {
    try {
      if (editingItem) {
        await updateItem(editingItem.id, item);
        showNotification("success", "Item updated successfully.");
      } else {
        await createItem(item);
        showNotification("success", "Item created successfully.");
      }
      await loadItems();
      handleCloseModal();
    } catch (err) {
      if (err.response && err.response.status === 400) {
        const details = err.response.data?.error?.details || [
          "Validation error",
        ];
        const message = details.join(" ");
        showNotification("error", message);
      } else {
        showNotification("error", "Failed to save item.");
      }
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }
    try {
      await deleteItem(id);
      showNotification("success", "Item deleted.");
      await loadItems();
    } catch (err) {
      showNotification("error", "Failed to delete item.");
    }
  };

  const categoryCounts = useMemo(() => {
    const counts = { all: items.length };
    ["monitor", "pc", "ups", "keyboard", "mouse"].forEach((cat) => {
      counts[cat] = items.filter((i) => i.category === cat).length;
    });
    return counts;
  }, [items]);

  return {
    items: pageItems,
    rawItems: items,
    loading,
    error,
    notification,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    page: currentPage,
    totalPages,
    totalItems,
    startIndex: startIndex + 1,
    endIndex: Math.min(startIndex + PAGE_SIZE, totalItems),
    setPage,
    modalOpen,
    editingItem,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseModal,
    handleSaveItem,
    handleDeleteItem,
    categoryCounts,
    reload: loadItems,
  };
}
