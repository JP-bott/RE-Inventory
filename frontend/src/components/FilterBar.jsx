import React from 'react';

function FilterBar({ categories, active, onChange, counts }) {
  return (
    <div className="filter-bar">
      <button
        type="button"
        className={`filter-chip ${active === 'all' ? 'active' : ''}`}
        onClick={() => onChange('all')}
      >
        All
        {counts && typeof counts.all === 'number' && (
          <span className="chip-count">{counts.all}</span>
        )}
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          className={`filter-chip ${active === cat ? 'active' : ''}`}
          onClick={() => onChange(cat)}
        >
          {cat}
          {counts && typeof counts[cat] === 'number' && (
            <span className="chip-count">{counts[cat]}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export default FilterBar;
