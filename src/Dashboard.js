import React, { useState } from "react";
import Papa from "papaparse";

export default function Dashboard() {
  const [products, setProducts] = useState({});
  const [query, setQuery] = useState("");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      delimiter: ";",
      encoding: "ISO-8859-1",
      complete: (results) => {
        const grouped = results.data.reduce((acc, row) => {
          const sku = row["SKU"];
          const attributeName = row["Attribute name"] || "";

          // Pomijamy meta_ dane
          if (!sku || attributeName.toLowerCase().startsWith("meta_")) return acc;

          if (!acc[sku]) acc[sku] = [];
          acc[sku].push(row);
          return acc;
        }, {});
        setProducts(grouped);
      },
    });
  };

  const filtered = Object.entries(products).filter(
    ([sku, rows]) =>
      sku.toLowerCase().includes(query.toLowerCase()) ||
      rows[0]["Item name"]?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>JTL Produkt-Dashboard</h1>
      <div style={{ marginBottom: "1rem" }}>
        <input type="file" accept=".csv" onChange={handleFileUpload} />
        <input
          style={{ marginLeft: "1rem" }}
          placeholder="Szukaj po SKU lub nazwie"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.map(([sku, rows]) => (
        <div key={sku} style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
          <h2>{sku} – {rows[0]["Item name"]}</h2>
          <ul>
            {rows.map((row, idx) => (
              <li key={idx}>
                <strong>{row["Attribute name"]}:</strong> {row["Attribute value"]}
              </li>
            ))}
          </ul>
        </div>
      ))}

      {!filtered.length && query.length > 2 && (
        <p>Brak wyników dla „{query}”</p>
      )}
    </div>
  );
}
