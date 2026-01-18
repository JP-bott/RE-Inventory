import React, { useEffect, useState } from 'react';

const initialState = {
  serialNumber: '',
  category: 'monitor',
  name: '',
};

function ItemForm({ categories, initialValues, onSubmit, onCancel }) {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      setValues({
        serialNumber: initialValues.serialNumber || '',
        category: initialValues.category || 'monitor',
        name: initialValues.name || '',
      });
    } else {
      setValues(initialState);
    }
    setErrors({});
  }, [initialValues]);

  const validate = () => {
    const newErrors = {};

    if (!values.serialNumber.trim()) {
      newErrors.serialNumber = 'Serial number is required.';
    }

    if (!values.category || !categories.includes(values.category)) {
      newErrors.category = 'Please select a valid category.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(values);
  };

  return (
    <form className="item-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label htmlFor="serialNumber">Serial Number</label>
        <input
          id="serialNumber"
          name="serialNumber"
          type="text"
          value={values.serialNumber}
          onChange={handleChange}
          placeholder="Enter serial number"
        />
        {errors.serialNumber && (
          <span className="field-error">{errors.serialNumber}</span>
        )}
      </div>

      <div className="form-row">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          name="category"
          value={values.category}
          onChange={handleChange}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <span className="field-error">{errors.category}</span>
        )}
      </div>

      <div className="form-row">
        <label htmlFor="name">Name (optional)</label>
        <input
          id="name"
          name="name"
          type="text"
          value={values.name}
          onChange={handleChange}
          placeholder="e.g. Office PC #1"
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {initialValues ? 'Update Item' : 'Add Item'}
        </button>
        {onCancel && (
          <button
            type="button"
            className="btn btn-text"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default ItemForm;
