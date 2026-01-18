import React, { useEffect, useState } from "react";

const CATEGORY_OPTIONS = [
  { value: "monitor", label: "Monitor" },
  { value: "pc", label: "PC" },
  { value: "ups", label: "UPS" },
  { value: "keyboard", label: "Keyboard" },
  { value: "mouse", label: "Mouse" },
];

export function ItemModal({ modalOpen, editingItem, handleCloseModal, handleSaveItem }) {
  const [serialNumber, setSerialNumber] = useState("");
  const [category, setCategory] = useState("monitor");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (modalOpen) {
      setErrors([]);
      if (editingItem) {
        setSerialNumber(editingItem.serialNumber || "");
        setCategory(editingItem.category || "monitor");
        setName(editingItem.name || "");
      } else {
        setSerialNumber("");
        setCategory("monitor");
        setName("");
      }
    }
  }, [modalOpen, editingItem]);

  if (!modalOpen) return null;

  const onSubmit = (e) => {
    e.preventDefault();
    const validationErrors = [];
    if (!serialNumber.trim()) {
      validationErrors.push("Serial number is required.");
    }
    if (!CATEGORY_OPTIONS.some((opt) => opt.value === category)) {
      validationErrors.push("Please choose a valid category.");
    }
    if (validationErrors.length) {
      setErrors(validationErrors);
      return;
    }

    handleSaveItem({ serialNumber, category, name });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>{editingItem ? "Edit Item" : "Add Item"}</h2>
        {errors.length > 0 && (
          <div className="alert alert-error">
            {errors.map((err, idx) => (
              <div key={idx}>{err}</div>
            ))}
          </div>
        )}
        <form onSubmit={onSubmit} className="modal-form">
          <label>
            Serial Number *
            <input
              type="text"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
            />
          </label>
          <label>
            Category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Name (optional)
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={handleCloseModal}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
