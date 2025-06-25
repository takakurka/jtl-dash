import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';

const CSV_URL = 'https://cdn.jsdelivr.net/gh/takakurka/jtl-dash@main/JTL_dashboard.csv';

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItem, setFilteredItem] = useState(null);

  useEffect(() => {
    Papa.parse(CSV_URL, {
      download: true,
      header: true,
      encoding: 'UTF-8',
      complete: (result) => {
        setData(result.data);
      },
    });
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredItem(null);
      return;
    }

    const term = searchTerm.toLowerCase();
    const found = data.find(
      (item) =>
        item.SKU?.toLowerCase().includes(term) ||
        item['Item name']?.toLowerCase().includes(term)
    );
    setFilteredItem(found || null);
  }, [searchTerm, data]);

  const attributes = filteredItem
    ? data.filter(
        (item) =>
          item.SKU?.toLowerCase() === filteredItem.SKU?.toLowerCase() &&
          item['Attribute'] &&
          item['Attribute value'] &&
          ![
            'barcode_type',
            'product_type',
            'active',
            'tags',
            'template_suffix',
          ].includes(item['Attribute']) &&
          !item['Attribute'].startsWith('meta_')
      )
    : [];

  return (
    <div style={{ maxWidth: '1000px', margin: '3rem auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>JTL Product Dashboard</h1>

      <input
        type="text"
        placeholder="Szukaj po SKU lub nazwie produktu..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          fontSize: '1rem',
          padding: '0.5rem 1rem',
          width: '100%',
          maxWidth: '700px',
          marginBottom: '2rem',
          borderRadius: '6px',
          border: '1px solid #444',
        }}
      />

      {filteredItem && (
        <>
          <p><strong>SKU:</strong> {filteredItem.SKU}</p>
          <p><strong>Name:</strong> {filteredItem['Item name']}</p>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '2rem' }}>
            <thead>
              <tr style={{ background: '#f4f4f4' }}>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '2px solid #ccc' }}>Attribute</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '2px solid #ccc' }}>Value</th>
              </tr>
            </thead>
            <tbody>
              {attributes.map((attr, index) => (
                <tr key={index}>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{attr['Attribute']}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{attr['Attribute value']}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {searchTerm && !filteredItem && (
        <p style={{ marginTop: '2rem', color: '#888' }}>
          Nie znaleziono produktu pasującego do: <strong>{searchTerm}</strong>
        </p>
      )}
    </div>
  );
}
