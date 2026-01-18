import React from 'react';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

function InventoryTable({ items, onEdit, onDelete }) {
  if (!items.length) {
    return <p className="empty-state">No items found.</p>;
  }

  return (
    <div className="table-wrapper">
      <table className="inventory-table">
        <thead>
          <tr>
            <th>Serial Number</th>
            <th>Category</th>
            <th>Name</th>
            <th className="actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.serialNumber}</td>
              <td className="badge-col">
                <span className={`category-badge category-${item.category}`}>
                  {item.category}
                </span>
              </td>
              <td>{item.name}</td>
              <td className="actions-col">
                <button
                  className="btn btn-secondary btn-icon"
                  onClick={() => onEdit(item)}
                  title="Edit item"
                >
                  <PencilSquareIcon className="icon" aria-hidden="true" />
                </button>
                <button
                  className="btn btn-danger btn-icon"
                  onClick={() => onDelete(item.id)}
                  title="Delete item"
                >
                  <TrashIcon className="icon" aria-hidden="true" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default InventoryTable;
