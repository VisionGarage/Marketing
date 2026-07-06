import React, { useEffect, useMemo, useState } from "react";
import type { Procedure, ProcedureCategory } from "../types";
import Modal from "../components/Modal";

const emptyForm = {
  make: "",
  model: "",
  year_from: "",
  year_to: "",
  category: "coding" as ProcedureCategory,
  title: "",
  description: "",
  preconditions: "",
  steps: "",
  tools_needed: "",
  risk_notes: ""
};

export default function Procedures() {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | ProcedureCategory>("all");
  const [editing, setEditing] = useState<Procedure | null>(null);
  const [viewing, setViewing] = useState<Procedure | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  function refresh() {
    window.api.procedures.list().then(setProcedures);
  }

  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => {
    return procedures.filter((p) => {
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        p.make.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q)
      );
    });
  }, [procedures, search, categoryFilter]);

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(p: Procedure) {
    setEditing(p);
    setForm({
      make: p.make,
      model: p.model,
      year_from: p.year_from?.toString() ?? "",
      year_to: p.year_to?.toString() ?? "",
      category: p.category,
      title: p.title,
      description: p.description,
      preconditions: p.preconditions,
      steps: (JSON.parse(p.steps || "[]") as string[]).join("\n"),
      tools_needed: p.tools_needed,
      risk_notes: p.risk_notes
    });
    setShowForm(true);
  }

  async function save() {
    const stepsArray = form.steps.split("\n").map((s) => s.trim()).filter(Boolean);
    await window.api.procedures.upsert({
      id: editing?.id,
      make: form.make.trim(),
      model: form.model.trim(),
      year_from: form.year_from ? Number(form.year_from) : null,
      year_to: form.year_to ? Number(form.year_to) : null,
      category: form.category,
      title: form.title.trim(),
      description: form.description.trim(),
      preconditions: form.preconditions.trim(),
      steps: JSON.stringify(stepsArray),
      tools_needed: form.tools_needed.trim(),
      risk_notes: form.risk_notes.trim()
    });
    setShowForm(false);
    refresh();
  }

  async function remove(id: number) {
    if (!confirm("Stergeti definitiv aceasta procedura?")) return;
    await window.api.procedures.delete(id);
    setViewing(null);
    refresh();
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Biblioteca Proceduri</h1>
          <p>Proceduri de coding si retrofit organizate pe marca, model si an.</p>
        </div>
        <button className="btn btn-gold" onClick={openNew}>+ Procedura noua</button>
      </div>

      <div className="card mb-1">
        <div className="card-pad" style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap", alignItems: "center" }}>
          <input
            placeholder="Cauta dupa marca, model sau titlu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 220, padding: "0.55rem 0.8rem", border: "1px solid var(--border)", borderRadius: 4, fontFamily: "inherit" }}
          />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as any)} style={{ padding: "0.55rem 0.8rem", border: "1px solid var(--border)", borderRadius: 4 }}>
            <option value="all">Toate categoriile</option>
            <option value="coding">Coding</option>
            <option value="retrofit">Retrofit</option>
          </select>
        </div>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">Nicio procedura gasita.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Titlu</th>
                <th>Marca / Model</th>
                <th>Ani</th>
                <th>Categorie</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td className="row-link" onClick={() => setViewing(p)}>{p.title}</td>
                  <td>{p.make} {p.model}</td>
                  <td>{p.year_from ?? "-"}{p.year_to ? ` - ${p.year_to}` : ""}</td>
                  <td><span className={`badge badge-${p.category}`}>{p.category === "coding" ? "Coding" : "Retrofit"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {viewing && (
        <Modal
          title={viewing.title}
          onClose={() => setViewing(null)}
          footer={
            <>
              <button className="btn btn-danger btn-sm" onClick={() => remove(viewing.id)}>Sterge</button>
              <button className="btn btn-ghost btn-sm" onClick={() => { openEdit(viewing); setViewing(null); }}>Editeaza</button>
              <button className="btn btn-gold btn-sm" onClick={() => setViewing(null)}>Inchide</button>
            </>
          }
        >
          <p className="small muted mb-1">
            {viewing.make} {viewing.model} · {viewing.year_from ?? "?"}{viewing.year_to ? `-${viewing.year_to}` : ""} ·{" "}
            <span className={`badge badge-${viewing.category}`}>{viewing.category === "coding" ? "Coding" : "Retrofit"}</span>
          </p>
          {viewing.description && <p className="mb-1">{viewing.description}</p>}
          {viewing.preconditions && (
            <>
              <h3 style={{ fontSize: "0.85rem", marginBottom: "0.3rem" }}>Precondiții</h3>
              <p className="small mb-1">{viewing.preconditions}</p>
            </>
          )}
          <h3 style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>Pași procedură</h3>
          <ol className="steps-list mb-1">
            {(JSON.parse(viewing.steps || "[]") as string[]).map((s, i) => (
              <li key={i}><span className="step-idx">{i + 1}</span><span>{s}</span></li>
            ))}
          </ol>
          {viewing.tools_needed && (
            <>
              <h3 style={{ fontSize: "0.85rem", marginBottom: "0.3rem" }}>Unelte necesare</h3>
              <p className="small mb-1">{viewing.tools_needed}</p>
            </>
          )}
          {viewing.risk_notes && (
            <>
              <h3 style={{ fontSize: "0.85rem", marginBottom: "0.3rem" }}>Note de risc</h3>
              <p className="small">{viewing.risk_notes}</p>
            </>
          )}
        </Modal>
      )}

      {showForm && (
        <Modal
          title={editing ? "Editeaza procedura" : "Procedura noua"}
          onClose={() => setShowForm(false)}
          footer={
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Anuleaza</button>
              <button className="btn btn-gold btn-sm" onClick={save} disabled={!form.make || !form.model || !form.title}>Salveaza</button>
            </>
          }
        >
          <div className="form-grid">
            <div className="form-field">
              <label>Marca *</label>
              <input value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Model *</label>
              <input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
            </div>
            <div className="form-field">
              <label>An inceput</label>
              <input type="number" value={form.year_from} onChange={(e) => setForm({ ...form, year_from: e.target.value })} />
            </div>
            <div className="form-field">
              <label>An sfarsit</label>
              <input type="number" value={form.year_to} onChange={(e) => setForm({ ...form, year_to: e.target.value })} />
            </div>
            <div className="form-field full">
              <label>Categorie</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ProcedureCategory })}>
                <option value="coding">Coding</option>
                <option value="retrofit">Retrofit</option>
              </select>
            </div>
            <div className="form-field full">
              <label>Titlu *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-field full">
              <label>Descriere</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-field full">
              <label>Precondiții</label>
              <textarea value={form.preconditions} onChange={(e) => setForm({ ...form, preconditions: e.target.value })} />
            </div>
            <div className="form-field full">
              <label>Pași (unul pe linie)</label>
              <textarea style={{ minHeight: 120 }} value={form.steps} onChange={(e) => setForm({ ...form, steps: e.target.value })} />
            </div>
            <div className="form-field full">
              <label>Unelte necesare</label>
              <input value={form.tools_needed} onChange={(e) => setForm({ ...form, tools_needed: e.target.value })} />
            </div>
            <div className="form-field full">
              <label>Note de risc</label>
              <textarea value={form.risk_notes} onChange={(e) => setForm({ ...form, risk_notes: e.target.value })} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
