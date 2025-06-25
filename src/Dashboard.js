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
        const rows = data.data || [];

        const clean = rows.filter(
          (row) => row["Attribute name"] && !row["Attribute name"].startsWith("meta_")
        );

        const grouped = clean.reduce((acc, row) => {
          const sku = row["SKU"];
          if (!acc[sku]) {
            acc[sku] = {
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
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  const product = products[query.trim()] || null;

  return (
    <div style={{ padding: "3rem", fontFamily: "sans-serif" }}>
      <h1>JTL Produkt-Dashboard</h1>
      <input
        style={{
          padding: "1rem",
          fontSize: "1.2rem",
          width: "100%",
          maxWidth: "600px",
          marginBottom: "2rem",
          border: "2px solid #333",
          borderRadius: "5px",
        }}
        type="text"
        placeholder="Wpisz SKU, np. bed006"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading && <p>Ładowanie danych...</p>}

      {!loading && query && !product && (
        <p>Nie znaleziono produktu o SKU: <strong>{query}</strong></p>
      )}

      {product && (
        <div style={{ marginTop: "2rem" }}>
          <h2>{product.name}</h2>
          <p><strong>GTIN:</strong> {product.gtin}</p>
          <h3>Atrybuty:</h3>
          <ul>
            {product.attributes.map((attr, i) => (
              <li key={i}>
                <strong>{attr.name}:</strong> {attr.value}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
