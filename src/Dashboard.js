// src/Dashboard.js
import React, { useState, useEffect } from "react";

const SHEETDB_URL = "https://sheetdb.io/api/v1/s3whprckk24jm";

function App() {
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch(SHEETDB_URL)
      .then((res) => res.json())
      .then((data) => {
        const rows = data?.data || [];

        const clean = rows.filter(
          (row) => !row["Attribute name"]?.startsWith("meta_")
        );

        const grouped = clean.reduce((acc, row) => {
          const sku = row["SKU"];
          if (!acc[sku]) {
            acc[sku] = {
              sku,
              name: row["Item name"],
              gtin: row["GTIN"],
              attributes: [],
            };
          }
          acc[sku].attributes.push({
            name: row["Attribute name"],
            value: row["Attribute value"],
          });
          return acc;
        }, {});

        setProducts(grouped);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading data:", err);
        setLoading(false);
      });
  }, []);

  const filtered = Object.values(products).filter((p) =>
    p.sku.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>JTL Produkt-Dashboard</h1>
      {loading ? (
        <p>Ładowanie danych z Google Drive...</p>
      ) : (
        <>
          <input
            type="text"
            placeholder="Szukaj po SKU..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              padding: "0.5rem",
              fontSize: "1rem",
              marginBottom: "1rem",
              width: "100%",
              maxWidth: "400px",
            }}
          />
          {filtered.map((product) => (
            <div
              key={product.sku}
              style={{
                border: "1px solid #ddd",
                marginBottom: "1rem",
                padding: "1rem",
                borderRadius: "8px",
              }}
            >
              <h2>{product.sku}</h2>
              <p><strong>Nazwa:</strong> {product.name}</p>
              <p><strong>GTIN:</strong> {product.gtin}</p>
              <ul>
                {product.attributes.map((attr, i) => (
                  <li key={i}>
                    <strong>{attr.name}:</strong> {attr.value}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default App;
