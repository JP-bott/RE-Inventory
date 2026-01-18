import React, { useEffect, useMemo, useState } from 'react';
import InventoryTable from './components/InventoryTable.jsx';
import ItemForm from './components/ItemForm.jsx';
import FilterBar from './components/FilterBar.jsx';
import Notification from './components/Notification.jsx';
import { fetchItems, createItem, updateItem, deleteItem } from './services/api.js';

const CATEGORIES = ['monitor', 'pc', 'ups', 'keyboard', 'mouse'];

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [filter, setFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [duplicateDialog, setDuplicateDialog] = useState('');
  const [page, setPage] = useState(1);

  const loadItems = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchItems();
      setItems(data);
    } catch (err) {
      setError(err.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setError('');
    setSuccess('');
    setPage(1);
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleSave = async (values) => {
    setError('');
    setSuccess('');

    const normalizedSerial = values.serialNumber.trim().toLowerCase();

    const hasDuplicate = items.some((item) => {
      if (editingItem && item.id === editingItem.id) return false;
      return item.serialNumber.trim().toLowerCase() === normalizedSerial;
    });

    if (hasDuplicate) {
      setDuplicateDialog('An item with this serial number already exists.');
      return;
    }

    try {
      if (editingItem) {
        const updated = await updateItem(editingItem.id, values);
        setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)));
        setSuccess('Item updated successfully.');
      } else {
        const created = await createItem(values);
        setItems((prev) => [...prev, created]);
        setSuccess('Item created successfully.');
      }
      setEditingItem(null);
      setIsFormOpen(false);
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('serial number must be unique')) {
        setDuplicateDialog(err.message);
      } else {
        setError(err.message || 'Operation failed.');
      }
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setError('');
    setSuccess('');
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    setError('');
    setSuccess('');
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteItem(id);
      setItems((prev) => prev.filter((it) => it.id !== id));
      setSuccess('Item deleted successfully.');
    } catch (err) {
      setError(err.message || 'Failed to delete item.');
    }
  };

  const categoryCounts = useMemo(() => {
    const base = { all: items.length };
    for (const cat of CATEGORIES) {
      base[cat] = items.filter((item) => item.category === cat).length;
    }
    return base;
  }, [items]);

  const filteredItems = useMemo(() => {
    let result = items;
    if (filter !== 'all') {
      result = result.filter((item) => item.category === filter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((item) => {
        const serial = item.serialNumber?.toLowerCase() || '';
        const name = item.name?.toLowerCase() || '';
        return serial.includes(q) || name.includes(q);
      });
    }

    return result;
  }, [items, filter, search]);

  const pageSize = 25;
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));

  const currentPage = Math.min(page, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage]);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Inventory Management</h1>
      </header>
      <main className="app-main">
        <section className="app-section list-section">
          <div className="list-header">
            <h2>Inventory Items</h2>
            <button className="refresh-button" onClick={loadItems} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <div className="toolbar-row">
            <FilterBar
              categories={CATEGORIES}
              active={filter}
              onChange={setFilter}
              counts={categoryCounts}
            />
            <div className="search-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Search by serial or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <InventoryTable
            items={paginatedItems}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <div className="pagination-row">
            <span className="pagination-info">
              Showing {paginatedItems.length ? (currentPage - 1) * pageSize + 1 : 0}
              {' '}
              -
              {' '}
              {Math.min(currentPage * pageSize, filteredItems.length)} of {filteredItems.length}
            </span>
            <div className="pagination-controls">
              <button
                type="button"
                className="btn btn-text"
                disabled={currentPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span className="pagination-page-label">Page {currentPage} / {totalPages}</span>
              <button
                type="button"
                className="btn btn-text"
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>
      <button
        type="button"
        className="floating-add-button"
        onClick={openCreateModal}
      >
        <span className="floating-add-icon">+</span>
      </button>

      {isFormOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h2>{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
              <button
                type="button"
                className="modal-close"
                onClick={closeFormModal}
                aria-label="Close add/edit item form"
              >
                ×
              </button>
            </div>
            <ItemForm
              categories={CATEGORIES}
              initialValues={editingItem}
              onSubmit={handleSave}
              onCancel={closeFormModal}
            />
          </div>
        </div>
      )}
      {duplicateDialog && (
        <div className="dialog-backdrop">
          <div className="dialog-panel">
            <h3>Duplicate serial number</h3>
            <p>{duplicateDialog}</p>
            <div className="dialog-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setDuplicateDialog('')}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      <Notification
        error={error}
        success={success}
        onClose={clearMessages}
      />
    </div>
  );
}

export default App;
