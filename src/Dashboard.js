import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';

const CSV_URL = 'https://cdn.jsdelivr.net/gh/takakurka/jtl-dash@main/JTL_dashboard.csv';

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    Papa.parse(CSV_URL, {
      download: true,
      header: true,
      encoding: 'ISO-8859-1', // lepsze dla niemieckich znaków
      complete: (result) => {
        setData(result.data);
      },
    });
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredItems([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const matches = data.filter(
      (item) =>
        item.SKU?.toLowerCase().includes(term) ||
        item['Item name']?.toLowerCase().includes(term)
    );

    const grouped = {};

    matches.forEach((item) => {
      const sku = item.SKU;
      if (!grouped[sku]) {
        grouped[sku] = {
          sku: sku,
          name: item['Item name'],
          attributes: [],
        };
      }

      const key = item.Attribute?.toLowerCase();
      if (
        key &&
        !key.startsWith('meta_') &&
        key !== 'tags' &&
        key !== 'template_suffix' &&
        key !== 'barcode_type' &&
        key !== 'product_type' &&
        key !== 'active'
      ) {
        grouped[sku].attributes.push({
          name: item.Attribute,
          value: item['Attribute value'],
        });
      }
    });

    setFilteredItems(Object.values(grouped));
  }, [searchTerm, data]);

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>JTL Product Dashboard</h1>
      <input
        type="text"
        placeholder="Search by SKU or Product Name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={styles.searchInput}
      />

      {filteredItems.length > 0 ? (
        filteredItems.map((item) => (
          <div key={item.sku} style={styles.resultBlock}>
            <p><strong>SKU:</strong> {item.sku}</p>
            <p><strong>Name:</strong> {item.name}</p>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Attribute</th>
                  <th style={styles.th}>Value</th>
                </tr>
              </thead>
              <tbody>
                {item.attributes.map((attr, idx) => (
                  <tr key={idx}>
                    <td style={styles.td}>{attr.name}</td>
                    <td style={styles.td}>{attr.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      ) : searchTerm ? (
        <p>No product found for <strong>{searchTerm}</strong>.</p>
      ) : null}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'system-ui, sans-serif',
    padding: '2rem',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  header: {
    fontSize: '2rem',
    marginBottom: '1.5rem',
  },
  searchInput: {
    width: '100%',
    padding: '1rem',
    fontSize: '1rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
    marginBottom: '2rem',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  resultBlock: {
    marginBottom: '3rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '1rem',
    fontSize: '0.95rem',
  },
  th: {
    backgroundColor: '#f5f5f5',
    textAlign: 'left',
    padding: '0.75rem',
    borderBottom: '2px solid #ddd',
  },
  td: {
    padding: '0.6rem 0.75rem',
    borderBottom: '1px solid #eee',
    verticalAlign: 'top',
  },
};
