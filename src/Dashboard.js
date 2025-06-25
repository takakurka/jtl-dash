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

    const filtered = data.filter(
      (item) =>
        item.SKU?.toLowerCase().includes(term) ||
        item['Item name']?.toLowerCase().includes(term)
    );

    const valueKey = data.length > 0
      ? Object.keys(data[0]).find(k =>
          k.toLowerCase().includes('wert') || k.toLowerCase() === 'value'
        ) || 'Value'
      : 'Value';

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
      const value = item[valueKey] || '';

      const shouldIgnore =
        !attrName ||
        attrName.startsWith('meta_') ||
        attrName === 'tags' ||
        attrName === 'template_suffix';

      if (!shouldIgnore) {
        grouped[sku].attributes.push({
          name: attrName,
          value: value,
        });
      }
    });

    setGroupedItems(Object.values(grouped));
  }, [searchTerm, data]);

  return (
    <div style={{ padding: '3rem' }}>
      <h1>JTL Product Dashboard</h1>
      <input
        type="text"
        placeholder="Search by SKU or item name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          fontSize: '1.5rem',
          padding: '0.5rem 1rem',
          width: '100%',
          maxWidth: '600px',
          marginBottom: '2rem',
        }}
      />

      {groupedItems.length > 0 ? (
        groupedItems.map((item) => (
          <div key={item.sku} style={{ marginBottom: '3rem' }}>
            <p><strong>SKU:</strong> {item.sku}</p>
            <p><strong>Name:</strong> {item.itemName}</p>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid black', padding: '8px' }}>Attribute</th>
                  <th style={{ border: '1px solid black', padding: '8px' }}>Value</th>
                </tr>
              </thead>
              <tbody>
                {item.attributes.map((attr, index) => (
                  <tr key={index}>
                    <td style={{ border: '1px solid black', padding: '8px' }}>{attr.name}</td>
                    <td style={{ border: '1px solid black', padding: '8px' }}>{attr.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      ) : searchTerm ? (
        <p>No product found matching: <strong>{searchTerm}</strong></p>
      ) : null}
    </div>
  );
}
