"use client";

export default function PrintReportButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      style={{
        border: "1px solid #167d96",
        background: "#fff",
        color: "#145d70",
        borderRadius: 10,
        padding: "10px 15px",
        fontWeight: 800,
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(21,83,99,.08)",
      }}
    >
      Свали PDF отчет
    </button>
  );
}
