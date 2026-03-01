"use client";

export default function OfflinePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFF9E6",
        fontFamily: "Fredoka, sans-serif",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>{"\uD83D\uDCE1"}</div>
      <h1
        style={{
          fontSize: "1.75rem",
          color: "#7C3AED",
          marginBottom: "0.5rem",
        }}
      >
        Tidak Ada Koneksi Internet
      </h1>
      <p
        style={{
          fontSize: "1.1rem",
          color: "#6B7280",
          marginBottom: "2rem",
          maxWidth: "320px",
        }}
      >
        Yuk coba lagi nanti ya! Pastikan kamu terhubung ke internet.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: "0.75rem 2rem",
          fontSize: "1.1rem",
          fontFamily: "Fredoka, sans-serif",
          fontWeight: 600,
          color: "white",
          backgroundColor: "#7C3AED",
          border: "none",
          borderRadius: "9999px",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)",
        }}
      >
        Coba Lagi
      </button>
    </div>
  );
}
