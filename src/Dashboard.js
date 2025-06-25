import React, { useEffect, useState } from "react";
import Papa from "papaparse";

export default function Dashboard() {
  const [products, setProducts] = useState({});
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // direct download link to your Google Drive file
  const csvUrl = "https://drive.google.com/uc?export=download&id=16w2WCY1Q5JmwxVMoGpiR9qS7S0Y7prTz";

  useEffect(() => {
    fetch(csvUrl)
      .then((res) => res.text())
      .then((text) => {
        Papa.parse(text, {
          header: true,
          delimiter: ";",
          encoding: "ISO-8859-1",
          complete: (results) => {
            const grouped = results.data.reduce((acc, row) => {
              const sku = row["SKU"];
              const attributeName = row["Attribute name"] || "";

              if (!sku || attributeName.toLowerCase().startsWith("meta_")) return acc;

              if (!acc[sku]) acc[sku] = [];
              acc[sku].push(row);
              return acc;
            }, {});
            setProducts(grouped);
            setLoading(false);
          },
        });
      });
  }, []);

  const filtered = Object.entries(products).filter(
    ([sku, rows]) =>
      sku.toLowerCase().includes(query.toLowerCase()) ||
      rows[0]["Item name"]?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>JTL Produkt-Dashboard</h1>

      {loading ? (
        <p>Ładowanie danych z Google Drive...</p>
      ) : (
        <>
          <input
            placeholder="Szukaj po SKU lub nazwie"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ marginBottom: "1rem", padding: "0.5rem", width: "100%", maxWidth: "400px" }}
          />

          {filtered.map(([sku, rows]) => (
            <div
              key={sku}
              style={{
                border: "1px solid #ccc",
                padding: "1rem",
                marginBottom: "1rem",
                borderRadius: "8px",
              }}
            >
              <h2>
                {sku} – {rows[0]["Item name"]}
              </h2>
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
        </>
      )}
    </div>
  );
}
