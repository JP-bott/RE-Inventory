import React from "react";
import { useInventory } from "./hooks/useInventory";
import { InventoryTable } from "./components/InventoryTable";
import { InventoryToolbar } from "./components/InventoryToolbar";
import { ItemModal } from "./components/ItemModal";
import { NotificationBar } from "./components/NotificationBar";

export default function App() {
  const inventory = useInventory();

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Inventory Management</h1>
      </header>
      <main className="app-main">
        <InventoryToolbar {...inventory} />
        <InventoryTable {...inventory} />
        <ItemModal {...inventory} />
        <NotificationBar {...inventory} />
      </main>
    </div>
  );
}
