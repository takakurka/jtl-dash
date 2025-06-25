import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

const CSV_URL = 'https://cdn.jsdelivr.net/gh/takakurka/jtl-dash@main/JTL_dashboard.csv';

function Dashboard() {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    fetch(CSV_URL)
      .then((res) => res.text())
      .then((text) => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setData(results.data);
          },
        });
      });
  }, []);

  useEffect(() => {
    const lowerQuery = query.toLowerCase();
    const result = data.filter(
      (item) =>
        item.SKU?.toLowerCase().includes(lowerQuery) ||
        item['Item Name']?.toLowerCase().includes(lowerQuery)
    );
    setFiltered(result);
  }, [query, data]);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '2rem' }}>JTL Produkt-Dashboard</h1>
      <input
        type="text"
        placeholder="Szukaj po SKU lub nazwie..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          padding: '1rem',
          fontSize: '1rem',
          width: '100%',
          maxWidth: '500px',
          marginBottom: '1.5rem',
        }}
      />

      {query && filtered.length === 0 && (
        <p>Nie znaleziono produktu pasującego do: <strong>{query}</strong></p>
      )}

      {filtered.length > 0 && (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              {Object.keys(filtered[0]).map((key) => (
                <th
                  key={key}
                  style={{ border: '1px solid #ccc', padding: '0.5rem', background: '#f9f9f9' }}
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, index) => (
              <tr key={index}>
                {Object.values(row).map((val, i) => (
                  <td key={i} style={{ border: '1px solid #ddd', padding: '0.5rem' }}>
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Dashboard;
