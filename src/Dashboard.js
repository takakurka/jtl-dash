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
          if (!sku) return acc;

          const lowerSku = sku.toLowerCase();

          if (!acc[lowerSku]) {
            acc[lowerSku] = {
              sku: lowerSku,
              name: row["Item name"],
              gtin: row["GTIN"],
              attributes: [],
            };
          }

          acc[lowerSku].attributes.push({
            name: row["Attribute name"],
            value: row["Attribute value"],
          });

          return acc;
        }, {});

        setProducts(grouped);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  const filtered = Object.values(products).filter((product) =>
    product.sku.toLowerCase().includes(query.toLowerCase()) ||
    product.name?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ padding: "3rem" }}>
      <h1>JTL Produkt-Dashboard</h1>
      <input
        type="text"
        placeholder="Szukaj po SKU lub nazwie..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ fontSize: "1.5rem", padding: "0.5rem", width: "600px" }}
      />
      {loading && <p>Ładowanie danych z Google Drive...</p>}

      {!loading && filtered.length === 0 && <p>Brak wyników</p>}

      {filtered.map((product) => (
        <div
          key={product.sku}
          style={{
            marginTop: "2rem",
            padding: "1rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        >
          <h2>{product.name}</h2>
          <p>
            <strong>SKU:</strong> {product.sku}
          </p>
          <p>
            <strong>GTIN:</strong> {product.gtin}
          </p>
          <ul>
            {product.attributes.map((attr, index) => (
              <li key={index}>
                <strong>{attr.name}:</strong> {attr.value}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default App;
