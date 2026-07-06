import React from "react";

export type Page = "dashboard" | "procedures" | "vehicles" | "clients" | "history";

interface SidebarProps {
  page: Page;
  onNavigate: (page: Page) => void;
}

const items: { key: Page; label: string }[] = [
  { key: "dashboard", label: "Sumar" },
  { key: "procedures", label: "Biblioteca Proceduri" },
  { key: "vehicles", label: "Vehicule" },
  { key: "clients", label: "Clienti" },
  { key: "history", label: "Istoric Interventii" }
];

export default function Sidebar({ page, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">V</div>
        <div className="sidebar-title">
          VisionGarage
          <small>Coding Manager</small>
        </div>
      </div>
      <ul className="nav-list">
        {items.map((item) => (
          <li
            key={item.key}
            className={`nav-item ${page === item.key ? "active" : ""}`}
            onClick={() => onNavigate(item.key)}
          >
            <span className="dot" />
            {item.label}
          </li>
        ))}
      </ul>
      <div className="sidebar-footer">
        Gestiune proceduri coding &amp; retrofit.<br />
        Fara comunicare directa cu ECU.
      </div>
    </aside>
  );
}
