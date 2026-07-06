import React, { useEffect, useState } from "react";
import type { Client, Vehicle } from "../types";
import Modal from "../components/Modal";

const emptyForm = { client_id: "", make: "", model: "", year: "", vin: "", engine: "", notes: "" };

interface VehiclesProps {
  onOpenVehicle: (id: number) => void;
}

export default function Vehicles({ onOpenVehicle }: VehiclesProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  function refresh() {
    window.api.vehicles.list().then(setVehicles);
    window.api.clients.list().then(setClients);
  }

  useEffect(() => { refresh(); }, []);

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(v: Vehicle) {
    setEditing(v);
    setForm({
      client_id: v.client_id?.toString() ?? "",
      make: v.make,
      model: v.model,
      year: v.year?.toString() ?? "",
      vin: v.vin,
      engine: v.engine,
      notes: v.notes
    });
    setShowForm(true);
  }

  async function save() {
    await window.api.vehicles.upsert({
      id: editing?.id,
      client_id: form.client_id ? Number(form.client_id) : null,
      make: form.make.trim(),
      model: form.model.trim(),
      year: form.year ? Number(form.year) : null,
      vin: form.vin.trim(),
      engine: form.engine.trim(),
      notes: form.notes.trim()
    });
    setShowForm(false);
    refresh();
  }

  async function remove(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Stergeti acest vehicul si toate fisierele/istoricul asociat?")) return;
    await window.api.vehicles.delete(id);
    refresh();
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Vehicule</h1>
          <p>Vehiculele clientilor, cu fisiere de coding si istoric interventii.</p>
        </div>
        <button className="btn btn-gold" onClick={openNew}>+ Vehicul nou</button>
      </div>

      <div className="card">
        {vehicles.length === 0 ? (
          <div className="empty-state">Niciun vehicul inregistrat inca.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Vehicul</th>
                <th>An</th>
                <th>VIN</th>
                <th>Client</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id} onClick={() => onOpenVehicle(v.id)} style={{ cursor: "pointer" }}>
                  <td className="row-link">{v.make} {v.model}</td>
                  <td>{v.year ?? "-"}</td>
                  <td>{v.vin || "-"}</td>
                  <td>{v.client_name ?? "-"}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); openEdit(v); }}>Editeaza</button>{" "}
                    <button className="btn btn-danger btn-sm" onClick={(e) => remove(v.id, e)}>Sterge</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <Modal
          title={editing ? "Editeaza vehicul" : "Vehicul nou"}
          onClose={() => setShowForm(false)}
          footer={
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Anuleaza</button>
              <button className="btn btn-gold btn-sm" onClick={save} disabled={!form.make || !form.model}>Salveaza</button>
            </>
          }
        >
          <div className="form-grid">
            <div className="form-field full">
              <label>Client</label>
              <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })}>
                <option value="">Fara client asociat</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Marca *</label>
              <input value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Model *</label>
              <input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
            </div>
            <div className="form-field">
              <label>An</label>
              <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
            </div>
            <div className="form-field">
              <label>VIN</label>
              <input value={form.vin} onChange={(e) => setForm({ ...form, vin: e.target.value })} />
            </div>
            <div className="form-field full">
              <label>Motorizare</label>
              <input value={form.engine} onChange={(e) => setForm({ ...form, engine: e.target.value })} />
            </div>
            <div className="form-field full">
              <label>Note</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
