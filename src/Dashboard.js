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
      skipEmptyLines: true,
      complete: (result) => {
        const groupedData = {};

        result.data.forEach((row) => {
          const sku = row.SKU?.trim();
          if (!sku) return;

          if (!groupedData[sku]) {
            groupedData[sku] = {
              SKU: sku,
              name: row['Item name'],
              attributes: [],
            };
          }

          const attrName = row['Attribute name']?.trim();
          const attrValue = row['Attribute value']?.trim();
          if (
            attrName &&
            attrValue &&
            !attrName.startsWith('meta_') &&
            !['tags', 'template_suffix', 'barcode_type', 'active', 'product_type'].includes(attrName)
          ) {
            groupedData[sku].attributes.push({
              name: attrName,
              value: attrValue,
            });
          }
        });

        setData(Object.values(groupedData));
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
        item.name?.toLowerCase().includes(term)
    );
    setFilteredItem(found || null);
  }, [searchTerm, data]);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>JTL Product Dashboard</h1>

      <input
        type="text"
        placeholder="Search by SKU or product name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          fontSize: '1rem',
          padding: '0.75rem 1rem',
          width: '100%',
          maxWidth: '600px',
          marginBottom: '2rem',
          borderRadius: '6px',
          border: '1px solid #333',
        }}
      />

      {filteredItem ? (
        <>
          <p><strong>SKU:</strong> {filteredItem.SKU}</p>
          <p><strong>Name:</strong> {filteredItem.name}</p>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead style={{ background: '#f3f3f3' }}>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '0.5rem', textAlign: 'left' }}>Attribute</th>
                <th style={{ border: '1px solid #ddd', padding: '0.5rem', textAlign: 'left' }}>Value</th>
              </tr>
            </thead>
            <tbody>
              {filteredItem.attributes.map((attr, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #eee', padding: '0.5rem', verticalAlign: 'top', width: '40%' }}>
                    {attr.name}
                  </td>
                  <td style={{ border: '1px solid #eee', padding: '0.5rem', verticalAlign: 'top' }}>
                    {attr.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : searchTerm ? (
        <p>No product found for: <strong>{searchTerm}</strong></p>
      ) : null}
    </div>
  );
}
