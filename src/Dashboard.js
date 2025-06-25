import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';

const CSV_URL = 'https://cdn.jsdelivr.net/gh/takakurka/jtl-dash@main/JTL_dashboard.csv';

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupedItems, setGroupedItems] = useState([]);

  useEffect(() => {
    Papa.parse(CSV_URL, {
      download: true,
      header: true,
      complete: (result) => {
        setData(result.data);
      },
    });
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setGroupedItems([]);
      return;
    }

    const term = searchTerm.toLowerCase();

    // Filtrowanie pasujących rekordów po SKU lub nazwie
    const filtered = data.filter(
      (item) =>
        item.SKU?.toLowerCase().includes(term) ||
        item['Item name']?.toLowerCase().includes(term)
    );

    // Grupowanie po SKU
    const grouped = {};
    filtered.forEach((item) => {
      const sku = item.SKU;
      if (!grouped[sku]) {
        grouped[sku] = {
          sku,
          itemName: item['Item name'],
          attributes: [],
        };
      }

      const attrName = item['Attribute name']?.trim();
      const shouldIgnore =
        !attrName ||
        attrName.startsWith('meta_') ||
        attrName === 'tags' ||
        attrName === 'template_suffix';

      if (!shouldIgnore) {
        grouped[sku].attributes.push({
          name: attrName,
          value: item['Wert'],
        });
      }
    });

    setGroupedItems(Object.values(grouped));
  }, [searchTerm, data]);

  return (
    <div style={{ padding: '3rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>JTL Produkt-Dashboard</h1>
      <input
        type="text"
        placeholder="Szukaj po SKU lub nazwie produktu..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          fontSize: '1.2rem',
          padding: '0.5rem 1rem',
          width: '100%',
          maxWidth: '600px',
          marginBottom: '2rem',
        }}
      />

      {groupedItems.length === 0 && searchTerm ? (
        <p>Nie znaleziono produktu pasującego do: <strong>{searchTerm}</strong></p>
      ) : (
        groupedItems.map((item) => (
          <div key={item.sku} style={{ marginBottom: '2rem', borderTop: '1px solid #ccc', paddingTop: '1rem' }}>
            <p><strong>SKU:</strong> {item.sku}</p>
            <p><strong>Nazwa:</strong> {item.itemName}</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #000', padding: '0.5rem', textAlign: 'left' }}>Atrybut</th>
                  <th style={{ border: '1px solid #000', padding: '0.5rem', textAlign: 'left' }}>Wartość</th>
                </tr>
              </thead>
              <tbody>
                {item.attributes.map((attr, index) => (
                  <tr key={index}>
                    <td style={{ border: '1px solid #000', padding: '0.5rem' }}>{attr.name}</td>
                    <td style={{ border: '1px solid #000', padding: '0.5rem' }}>{attr.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}
