import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

function NoElectronNotice() {
  return (
    <div style={{ padding: "3rem", maxWidth: 560, margin: "0 auto", fontFamily: "Jost, sans-serif" }}>
      <h1 style={{ marginBottom: "1rem" }}>Ruleaza in Electron, nu direct in browser</h1>
      <p style={{ marginBottom: "1rem", lineHeight: 1.6 }}>
        Aceasta pagina a fost deschisa direct intr-un browser, fara fereastra Electron,
        asa ca API-ul local (baza de date, fisiere) nu este disponibil.
      </p>
      <p style={{ lineHeight: 1.6 }}>
        Ruleaza <code>npm run build</code> apoi{" "}
        <code>VITE_DEV_SERVER_URL=http://localhost:5173 npx electron .</code>{" "}
        intr-un terminal separat, cat timp <code>npm run dev</code> ruleaza in celalalt.
      </p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {window.api ? <App /> : <NoElectronNotice />}
  </React.StrictMode>
);
