import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';

const CSV_URL = 'https://cdn.jsdelivr.net/gh/takakurka/jtl-dash@main/JTL_dashboard.csv';

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupedData, setGroupedData] = useState([]);

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
      setGroupedData([]);
      return;
    }

    const term = searchTerm.toLowerCase();

    const filtered = data.filter(
      (item) =>
        item.SKU?.toLowerCase().includes(term) ||
        item['Item name']?.toLowerCase().includes(term)
    );

    // Grupa wg SKU
    const grouped = filtered.reduce((acc, item) => {
      const sku = item.SKU;
      if (!acc[sku]) {
        acc[sku] = {
          sku,
          name: item['Item name'],
          attributes: [],
        };
      }

      const attr = item['Attribute name'];
      const skipAttr =
        !attr ||
        attr.toLowerCase().startsWith('meta_') ||
        attr.toLowerCase().startsWith('tags') ||
        attr.toLowerCase().startsWith('template_suffix');

      if (!skipAttr) {
        acc[sku].attributes.push({
          name: attr,
          value: item['Attribute value'],
        });
      }

      return acc;
    }, {});

    setGroupedData(Object.values(grouped));
  }, [searchTerm, data]);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>JTL Product Dashboard</h1>
      <input
        type="text"
        placeholder="Search by SKU or Item name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          fontSize: '1.2rem',
          padding: '0.5rem 1rem',
          width: '100%',
          maxWidth: '500px',
          marginBottom: '2rem',
        }}
      />

      {groupedData.length === 0 && searchTerm ? (
        <p>No product found matching: <strong>{searchTerm}</strong></p>
      ) : (
        groupedData.map((group) => (
          <div key={group.sku} style={{ marginBottom: '3rem' }}>
            <p><strong>SKU:</strong> {group.sku}</p>
            <p><strong>Name:</strong> {group.name}</p>

            <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: '1rem' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #ccc', padding: '8px' }}>Attribute</th>
                  <th style={{ border: '1px solid #ccc', padding: '8px' }}>Value</th>
                </tr>
              </thead>
              <tbody>
                {group.attributes.map((attr, index) => (
                  <tr key={index}>
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>{attr.name}</td>
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>{attr.value}</td>
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
