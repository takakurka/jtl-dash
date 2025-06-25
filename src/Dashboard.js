// src/App.js
import React, { useState, useEffect } from "react";
import "./App.css";

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
      });
  }, []);

  const filtered = Object.values(products).filter((p) =>
    p.sku.toLowerCase().includes(query.toLowerCase()) ||
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="App">
      <h1>📦 JTL Dashboard</h1>
      <input
        type="text"
        placeholder="Szukaj po SKU lub nazwie"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search"
      />

      {loading ? (
        <p>Ładowanie danych…</p>
      ) : filtered.length === 0 ? (
        <p>Brak wyników.</p>
      ) : (
        <ul className="product-list">
          {filtered.map((product) => (
            <li key={product.sku} className="product-card">
              <h2>{product.name}</h2>
              <p><strong>SKU:</strong> {product.sku}</p>
              <p><strong>GTIN:</strong> {product.gtin}</p>
              <ul>
                {product.attributes.map((attr, i) => (
                  <li key={i}>
                    <strong>{attr.name}:</strong> {attr.value}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
