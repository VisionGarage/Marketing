import React, { useState } from "react";
import Sidebar, { Page } from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Procedures from "./pages/Procedures";
import Vehicles from "./pages/Vehicles";
import VehicleDetail from "./pages/VehicleDetail";
import Clients from "./pages/Clients";
import History from "./pages/History";

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);

  function navigate(next: Page) {
    setSelectedVehicleId(null);
    setPage(next);
  }

  function openVehicle(id: number) {
    setSelectedVehicleId(id);
    setPage("vehicles");
  }

  return (
    <div className="app-shell">
      <Sidebar page={page} onNavigate={navigate} />
      <main className="main">
        {page === "dashboard" && <Dashboard />}
        {page === "procedures" && <Procedures />}
        {page === "clients" && <Clients />}
        {page === "vehicles" && (
          selectedVehicleId
            ? <VehicleDetail vehicleId={selectedVehicleId} onBack={() => setSelectedVehicleId(null)} />
            : <Vehicles onOpenVehicle={openVehicle} />
        )}
        {page === "history" && <History onOpenVehicle={openVehicle} />}
      </main>
    </div>
  );
}
