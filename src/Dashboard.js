import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import './Dashboard.css';


const CSV_URL = 'https://cdn.jsdelivr.net/gh/takakurka/jtl-dash@main/JTL_dashboard.csv';

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    Papa.parse(CSV_URL, {
      download: true,
      header: true,
      complete: (result) => {
        const cleanedData = result.data.map((row) => {
          // Decode HTML entities like ü, ä, etc.
          const decode = (str) => {
            try {
              return decodeURIComponent(escape(str));
            } catch {
              return str;
            }
          };

          const newRow = {};
          for (const key in row) {
            newRow[key] = decode(row[key]);
          }
          return newRow;
        });
        setData(cleanedData);
      },
    });
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredItems([]);
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = data.filter(
      (item) =>
        item.SKU?.toLowerCase().includes(term) ||
        item['Item name']?.toLowerCase().includes(term)
    );

    const grouped = {};
    filtered.forEach((item) => {
      const sku = item.SKU;
      if (!grouped[sku]) {
        grouped[sku] = {
          sku: sku,
          name: item['Item name'],
          attributes: [],
        };
      }
      const attr = item['Attribute name'];
      const val = item['Attribute value'];

      if (
        attr &&
        val &&
        !attr.startsWith('meta_') &&
        !['tags', 'template_suffix', 'barcode_type', 'active', 'product_type'].includes(attr)
      ) {
        grouped[sku].attributes.push({ attr, val });
      }
    });

    setFilteredItems(Object.values(grouped));
  }, [searchTerm, data]);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>JTL Product Dashboard</h1>
      <input
        type="text"
        placeholder="Search by SKU or Item Name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          fontSize: '1rem',
          padding: '0.5rem',
          width: '100%',
          maxWidth: '600px',
          margin: '1rem 0',
        }}
      />

      {filteredItems.map((item, idx) => (
        <div key={idx} style={{ marginBottom: '2rem' }}>
          <p><strong>SKU:</strong> {item.sku}</p>
          <p><strong>Name:</strong> {item.name}</p>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ccc', padding: '0.5rem', textAlign: 'left' }}>Attribute</th>
                <th style={{ border: '1px solid #ccc', padding: '0.5rem', textAlign: 'left' }}>Value</th>
              </tr>
            </thead>
            <tbody>
              {item.attributes.map((attr, i) => (
                <tr key={i}>
                  <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>{attr.attr}</td>
                  <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>{attr.val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
