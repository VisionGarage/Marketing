import React, { useEffect, useState } from "react";
import type { Client } from "../types";
import Modal from "../components/Modal";

const emptyForm = { name: "", phone: "", email: "", notes: "" };

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [editing, setEditing] = useState<Client | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  function refresh() {
    window.api.clients.list().then(setClients);
  }

  useEffect(() => { refresh(); }, []);

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(c: Client) {
    setEditing(c);
    setForm({ name: c.name, phone: c.phone, email: c.email, notes: c.notes });
    setShowForm(true);
  }

  async function save() {
    await window.api.clients.upsert({ id: editing?.id, ...form });
    setShowForm(false);
    refresh();
  }

  async function remove(id: number) {
    if (!confirm("Stergeti acest client? Vehiculele asociate vor ramane, dar fara client asociat.")) return;
    await window.api.clients.delete(id);
    refresh();
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Clienti</h1>
          <p>Evidenta clientilor VisionGarage.</p>
        </div>
        <button className="btn btn-gold" onClick={openNew}>+ Client nou</button>
      </div>

      <div className="card">
        {clients.length === 0 ? (
          <div className="empty-state">Niciun client inregistrat inca.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nume</th>
                <th>Telefon</th>
                <th>Email</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id}>
                  <td className="row-link" onClick={() => openEdit(c)}>{c.name}</td>
                  <td>{c.phone || "-"}</td>
                  <td>{c.email || "-"}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(c.id)}>Sterge</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <Modal
          title={editing ? "Editeaza client" : "Client nou"}
          onClose={() => setShowForm(false)}
          footer={
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Anuleaza</button>
              <button className="btn btn-gold btn-sm" onClick={save} disabled={!form.name}>Salveaza</button>
            </>
          }
        >
          <div className="form-field">
            <label>Nume *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Telefon</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Email</label>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Note</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </Modal>
      )}
    </div>
  );
}
