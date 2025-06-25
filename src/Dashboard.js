import React, { useState, useEffect } from "react";

const SHEETDB_URL = "https://sheetdb.io/api/v1/s3whprckk24jm";

function Dashboard() {
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch(SHEETDB_URL)
      .then((res) => res.json())
      .then((data) => {
        const rows = data.data || [];

        const clean = rows.filter(
          (row) =>
            row["Attribute name"] &&
            !row["Attribute name"].startsWith("meta_") &&
            row["SKU"]
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
      .catch((error) => {
        console.error("Błąd podczas ładowania danych:", error);
        setLoading(false);
      });
  }, []);

  const filtered = Object.values(products).filter((product) =>
    product.sku.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ padding: "4rem", fontFamily: "sans-serif" }}>
      <h1>JTL Produkt-Dashboard</h1>
      <input
        style={{
          fontSize: "1.5rem",
          padding: "0.5rem",
          width: "100%",
          maxWidth: "600px",
          marginBottom: "2rem",
          border: "1px solid #333",
          borderRadius: "6px",
        }}
        type="text"
        placeholder="Szukaj po SKU..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {loading ? (
        <p>Ładowanie danych...</p>
      ) : (
        filtered.map((product) => (
          <div key={product.sku} style={{ marginBottom: "2rem" }}>
            <h2>{product.name} ({product.sku})</h2>
            <p><strong>GTIN:</strong> {product.gtin}</p>
            <ul>
              {product.attributes.map((attr, index) => (
                <li key={index}>
                  <strong>{attr.name}:</strong> {attr.value}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}

export default Dashboard;
