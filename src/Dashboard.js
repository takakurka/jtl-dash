import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';

// Your CSV file URL
const CSV_URL = 'https://cdn.jsdelivr.net/gh/takakurka/jtl-dash@main/JTL_dashboard.csv';

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRows, setFilteredRows] = useState([]);

  // List of attributes to exclude
  const excludedAttributes = [
    'meta_', 'tags', 'template_suffix', 'barcode_type', 'active', 'product_type'
  ];

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
      setFilteredRows([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const matched = data.filter(
      (row) =>
        row.SKU?.toLowerCase().includes(term) ||
        row['Item name']?.toLowerCase().includes(term)
    );

    // Group by SKU
    const grouped = matched.reduce((acc, row) => {
      const sku = row.SKU;
      if (!acc[sku]) {
        acc[sku] = {
          sku,
          itemName: row['Item name'],
          attributes: [],
        };
      }

      const attribute = row['Attribute name'];
      const value = row['Attribute value'];

      if (
        attribute &&
        !excludedAttributes.some((ex) => attribute.startsWith(ex))
      ) {
        acc[sku].attributes.push({ attribute, value });
      }

      return acc;
    }, {});

    setFilteredRows(Object.values(grouped));
  }, [searchTerm, data]);

  return (
    <div style={{ padding: '3rem', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '2rem' }}>JTL Product Dashboard</h1>

      <input
        type="text"
        placeholder="Search by SKU or Product Name..."
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

      {filteredRows.map((item, idx) => (
        <div key={idx} style={{ marginBottom: '3rem' }}>
          <p><strong>SKU:</strong> {item.sku}</p>
          <p><strong>Name:</strong> {decodeURIComponent(escape(item.itemName || ''))}</p>
          <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: '1rem' }}>
            <thead>
              <tr>
                <th style={styles.th}>Attribute</th>
                <th style={styles.th}>Value</th>
              </tr>
            </thead>
            <tbody>
              {item.attributes.map((attr, i) => (
                <tr key={i}>
                  <td style={styles.td}>{attr.attribute}</td>
                  <td style={styles.td}>{attr.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {searchTerm && filteredRows.length === 0 && (
        <p>No product found for: <strong>{searchTerm}</strong></p>
      )}
    </div>
  );
}

const styles = {
  th: {
    border: '1px solid #ccc',
    padding: '8px',
    backgroundColor: '#f8f8f8',
    fontWeight: 'bold',
    textAlign: 'left',
  },
  td: {
    border: '1px solid #ccc',
    padding: '8px',
    verticalAlign: 'top',
  },
};
