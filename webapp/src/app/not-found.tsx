// Global not-found necesar de Next pentru rute care nu se potrivesc cu niciun locale.
export default function GlobalNotFound() {
  return (
    <html lang="ro">
      <body
        style={{
          background: "#0d1e1c",
          color: "#f4efe4",
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>404</h1>
          <p style={{ opacity: 0.7 }}>Pagina nu a fost găsită.</p>
          <a href="/" style={{ color: "#d4ae55" }}>
            VisionGarage
          </a>
        </div>
      </body>
    </html>
  );
}
