import React from "react";

const CATEGORY_FILTERS = [
  { key: "all", label: "All" },
  { key: "monitor", label: "Monitor" },
  { key: "pc", label: "PC" },
  { key: "ups", label: "UPS" },
  { key: "keyboard", label: "Keyboard" },
  { key: "mouse", label: "Mouse" },
];

export function InventoryToolbar({
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
  categoryCounts,
  startIndex,
  endIndex,
  totalItems,
  page,
  totalPages,
  setPage,
  handleOpenCreate,
  reload,
}) {
  return (
    <div className="toolbar">
      <div className="toolbar-row">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by serial number or name"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="toolbar-actions">
          <button className="btn-secondary" onClick={reload}>
            Refresh
          </button>
          <button className="btn-primary floating" onClick={handleOpenCreate}>
            +
          </button>
        </div>
      </div>
      <div className="toolbar-row">
        <div className="chips">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat.key}
              className={
                "chip" + (categoryFilter === cat.key ? " chip-active" : "")
              }
              onClick={() => {
                setCategoryFilter(cat.key);
                setPage(1);
              }}
            >
              {cat.label} ({categoryCounts?.[cat.key] ?? 0})
            </button>
          ))}
        </div>
        <div className="pagination">
          <span className="pagination-summary">
            {totalItems > 0
              ? `Showing ${startIndex}-${endIndex} of ${totalItems}`
              : "No results"}
          </span>
          <button
            className="btn-secondary"
            disabled={page <= 1}
            onClick={() => setPage(Math.max(1, page - 1))}
          >
            Previous
          </button>
          <button
            className="btn-secondary"
            disabled={page >= totalPages}
            onClick={() => setPage(Math.min(totalPages, page + 1))}
          >
            Next
          </button>
          <span className="pagination-pages">
            Page {page} of {totalPages}
          </span>
        </div>
      </div>
    </div>
  );
}
