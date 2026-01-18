import React from "react";

const CATEGORY_LABELS = {
  monitor: "Monitor",
  pc: "PC",
  ups: "UPS",
  keyboard: "Keyboard",
  mouse: "Mouse",
};

export function InventoryTable({ items, loading, handleOpenEdit, handleDeleteItem }) {
  if (loading) {
    return <div className="loading">Loading inventory…</div>;
  }

  if (!items.length) {
    return <div className="empty-state">No items to display.</div>;
  }

  return (
    <table className="inventory-table">
      <thead>
        <tr>
          <th>Serial Number</th>
          <th>Category</th>
          <th>Name</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td>{item.serialNumber}</td>
            <td>
              <span className={`badge badge-${item.category}`}>
                {CATEGORY_LABELS[item.category] || item.category}
              </span>
            </td>
            <td>{item.name}</td>
            <td>
              <button onClick={() => handleOpenEdit(item)} className="btn-link">
                Edit
              </button>
              <button
                onClick={() => handleDeleteItem(item.id)}
                className="btn-link btn-link-danger"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
