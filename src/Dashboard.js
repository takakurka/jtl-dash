import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';

const CSV_URL = 'https://cdn.jsdelivr.net/gh/takakurka/jtl-dash@main/JTL_dashboard.csv';

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupedItems, setGroupedItems] = useState({});

  // Proper UTF-8 CSV loading
  useEffect(() => {
    fetch(CSV_URL)
      .then((response) => response.arrayBuffer())
      .then((buffer) => {
        const decoder = new TextDecoder('utf-8');
        const text = decoder.decode(buffer);
        const parsed = Papa.parse(text, { header: true });
        setData(parsed.data);
      });
  }, []);

  // Search and group items by SKU
  useEffect(() => {
    if (!searchTerm) {
      setGroupedItems({});
      return;
    }

    const term = searchTerm.toLowerCase();
    const matches = data.filter(
      (item) =>
        item.SKU?.toLowerCase().includes(term) ||
        item['Item name']?.toLowerCase().includes(term)
    );

    const grouped = {};
    for (const item of matches) {
      const sku = item.SKU || 'Unknown SKU';
      if (!grouped[sku]) {
        grouped[sku] = {
          name: item['Item name'] || 'Unknown name',
          attributes: [],
        };
      }

      const attrName = item['Attribute name'];
      const attrValue = item['Attribute value'];

      if (
        !attrName ||
        attrName.startsWith('meta_') ||
        ['tags', 'template_suffix', 'barcode_type'].includes(attrName)
      ) {
        continue;
      }

      grouped[sku].attributes.push({ name: attrName, value: attrValue });
    }

    setGroupedItems(grouped);
  }, [searchTerm, data]);

  return (
    <div style={{ padding: '3rem' }}>
      <h1>JTL Product Dashboard</h1>
      <input
        type="text"
        placeholder="Search by SKU or product name..."
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

      {Object.keys(groupedItems).length > 0 ? (
        Object.entries(groupedItems).map(([sku, itemData]) => (
          <div key={sku} style={{ marginBottom: '3rem' }}>
            <p><strong>SKU:</strong> {sku}</p>
            <p><strong>Name:</strong> {itemData.name}</p>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid black', textAlign: 'left', padding: '4px' }}>Attribute</th>
                  <th style={{ border: '1px solid black', textAlign: 'left', padding: '4px' }}>Value</th>
                </tr>
              </thead>
              <tbody>
                {itemData.attributes.map((attr, idx) => (
                  <tr key={idx}>
                    <td style={{ border: '1px solid black', padding: '4px' }}>{attr.name}</td>
                    <td style={{ border: '1px solid black', padding: '4px' }}>{attr.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      ) : searchTerm ? (
        <p>No matching product found for: <strong>{searchTerm}</strong></p>
      ) : null}
    </div>
  );
}
