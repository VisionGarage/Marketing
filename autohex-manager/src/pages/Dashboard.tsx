import React, { useEffect, useState } from "react";
import type { Procedure, Vehicle, Job } from "../types";

export default function Dashboard() {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    window.api.procedures.list().then(setProcedures);
    window.api.vehicles.list().then(setVehicles);
    window.api.jobs.listAll().then(setJobs);
  }, []);

  const inProgress = jobs.filter((j) => j.status === "in_progress").length;
  const done = jobs.filter((j) => j.status === "done").length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Sumar Activitate</h1>
          <p>Vedere de ansamblu asupra procedurilor, vehiculelor si interventiilor VisionGarage.</p>
        </div>
      </div>

      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-num">{procedures.length}</div>
          <div className="stat-label">Proceduri in biblioteca</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{vehicles.length}</div>
          <div className="stat-label">Vehicule inregistrate</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{inProgress}</div>
          <div className="stat-label">Interventii in lucru</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{done}</div>
          <div className="stat-label">Interventii finalizate</div>
        </div>
      </div>

      <div className="card">
        <div className="card-pad">
          <h2 className="mb-1" style={{ fontSize: "1.05rem" }}>Ultimele interventii</h2>
          {jobs.length === 0 ? (
            <div className="empty-state">Nu exista inca interventii inregistrate.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Vehicul</th>
                  <th>Procedura</th>
                  <th>Status</th>
                  <th>Tehnician</th>
                </tr>
              </thead>
              <tbody>
                {jobs.slice(0, 8).map((job) => (
                  <tr key={job.id}>
                    <td>{new Date(job.job_date).toLocaleDateString("ro-RO")}</td>
                    <td>{job.make} {job.model} {job.vin ? `(${job.vin})` : ""}</td>
                    <td>{job.procedure_title ?? "-"}</td>
                    <td><span className={`badge badge-${job.status}`}>{statusLabel(job.status)}</span></td>
                    <td>{job.technician || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function statusLabel(status: string) {
  switch (status) {
    case "planned": return "Planificat";
    case "in_progress": return "In lucru";
    case "done": return "Finalizat";
    case "failed": return "Esuat";
    default: return status;
  }
}
