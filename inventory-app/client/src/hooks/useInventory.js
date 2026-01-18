import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 25;
const STORAGE_KEY = "inventory-items";

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

  const loadFromStorage = () => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setItems([]);
        return;
      }
      const parsed = JSON.parse(raw);
      setItems(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      console.error("Failed to read inventory from storage", e);
      setItems([]);
      setError("Failed to read saved inventory.");
      showNotification("error", "Failed to read saved inventory.");
    }
  };

  const saveToStorage = (nextItems) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
    } catch (e) {
      console.error("Failed to save inventory to storage", e);
      showNotification("error", "Failed to save inventory locally.");
    }
  };

  useEffect(() => {
    setLoading(true);
    loadFromStorage();
    setLoading(false);
  }, []);

  const filteredItems = useMemo(() => {
    const safeItems = Array.isArray(items) ? items : [];
    const term = search.trim().toLowerCase();
    return safeItems.filter((item) => {
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
    const serial = typeof item.serialNumber === "string" ? item.serialNumber.trim() : "";
    if (!serial) {
      showNotification("error", "Serial number is required.");
      return;
    }

    const lowerSerial = serial.toLowerCase();
    const duplicate = items.find(
      (i) =>
        i.serialNumber &&
        i.serialNumber.toLowerCase() === lowerSerial &&
        (!editingItem || i.id !== editingItem.id)
    );

    if (duplicate) {
      showNotification("error", "An item with this serial number already exists.");
      return;
    }

    const nextItems = [...items];

    if (editingItem) {
      const index = nextItems.findIndex((i) => i.id === editingItem.id);
      if (index !== -1) {
        nextItems[index] = {
          ...nextItems[index],
          serialNumber: serial,
          category: item.category,
          name: item.name ?? "",
        };
      }
      showNotification("success", "Item updated successfully.");
    } else {
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      nextItems.push({
        id,
        serialNumber: serial,
        category: item.category,
        name: item.name ?? "",
        description: "",
      });
      showNotification("success", "Item created successfully.");
    }

    setItems(nextItems);
    saveToStorage(nextItems);
    handleCloseModal();
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }
    const nextItems = items.filter((i) => i.id !== id);
    setItems(nextItems);
    saveToStorage(nextItems);
    showNotification("success", "Item deleted.");
  };

  const categoryCounts = useMemo(() => {
    const safeItems = Array.isArray(items) ? items : [];
    const counts = { all: safeItems.length };
    ["monitor", "pc", "ups", "keyboard", "mouse"].forEach((cat) => {
      counts[cat] = safeItems.filter((i) => i.category === cat).length;
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
		reload: loadFromStorage,
  };
}
