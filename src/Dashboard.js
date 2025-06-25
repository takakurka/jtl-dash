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
        const rows = data?.data || [];

        const clean = rows.filter(
          (row) => !row["Attribute name"]?.toLowerCase().startsWith("meta_")
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

  const filteredProduct = Object.values(products).find((p) => {
    const q = query.toLowerCase();
    return (
      p.sku?.toLowerCase().includes(q) ||
      p.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>JTL Produkt-Dashboard</h1>
      <input
        type="text"
        placeholder="Wpisz SKU lub nazwę produktu"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          fontSize: "1.5rem",
          padding: "0.5rem",
          width: "100%",
          maxWidth: "600px",
          marginBottom: "2rem",
        }}
      />
      {loading && <p>Ładowanie danych...</p>}
      {!loading && query && !filteredProduct && (
        <p>
          Nie znaleziono produktu pasującego do: <strong>{query}</strong>
        </p>
      )}
      {!loading && filteredProduct && (
        <div>
          <h2>{filteredProduct.name}</h2>
          <p><strong>SKU:</strong> {filteredProduct.sku}</p>
          <p><strong>GTIN:</strong> {filteredProduct.gtin}</p>
          <h3>Atrybuty:</h3>
          <ul>
            {filteredProduct.attributes.map((attr, index) => (
              <li key={index}>
                <strong>{attr.name}:</strong> {attr.value}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
