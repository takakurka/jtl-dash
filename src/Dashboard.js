import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import './dashboard.css';

const CSV_URL = 'https://cdn.jsdelivr.net/gh/takakurka/jtl-dash@main/JTL_dashboard.csv';

const IGNORED_ATTRIBUTES = [
  'tags',
  'template_suffix',
  'barcode_type',
  'active',
  'product_type',
];

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [attributeSearchTerm, setAttributeSearchTerm] = useState('');
  const [attributeFiltered, setAttributeFiltered] = useState([]);

  useEffect(() => {
    Papa.parse(CSV_URL, {
      download: true,
      header: true,
      complete: (result) => {
        const cleanedData = result.data.map((row) => {
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
      if (!sku || sku.endsWith('-0')) return;
      if (!grouped[sku]) {
        grouped[sku] = {
          sku: sku,
          name: item['Item name'],
          attributes: [],
        };
      }
      const attr = item['Attribute name'];
      const val = item['Attribute value'];
      if (attr && val && !attr.startsWith('meta_') && !IGNORED_ATTRIBUTES.includes(attr)) {
        grouped[sku].attributes.push({ attr, val });
      }
    });

    setFilteredItems(Object.values(grouped));
  }, [searchTerm, data]);

  useEffect(() => {
    if (!attributeSearchTerm) {
      setAttributeFiltered([]);
      return;
    }
    const term = attributeSearchTerm.toLowerCase();
    const grouped = {};
    data.forEach((item) => {
      const attr = item['Attribute name'];
      const val = item['Attribute value'];
      const sku = item.SKU;

      if (
        sku &&
        !sku.endsWith('-0') &&
        attr &&
        val &&
        !attr.startsWith('meta_') &&
        !IGNORED_ATTRIBUTES.includes(attr) &&
        (attr.toLowerCase().includes(term) || val.toLowerCase().includes(term))
      ) {
        if (!grouped[sku]) {
          grouped[sku] = {
            sku: sku,
            attributes: [],
          };
        }
        grouped[sku].attributes.push({ attr, val });
      }
    });
    setAttributeFiltered(Object.values(grouped));
  }, [attributeSearchTerm, data]);

  return (
    <div className="container">
      <h1 className="title">JTL Product Dashboard</h1>

      <input
        type="text"
        placeholder="Search by SKU or Item Name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      {filteredItems.map((item, idx) => (
        <div key={idx} className="product-block">
          <p><strong className="highlight-sku">SKU:</strong> {item.sku}</p>
          <p><strong>Name:</strong> {item.name}</p>
          <table className="attribute-table">
            <thead>
              <tr>
                <th>Attribute</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {item.attributes.map((attr, i) => (
                <tr key={i}>
                  <td>{attr.attr}</td>
                  <td>{attr.val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <div className="attribute-search">
        <h2>Search by Attribute</h2>
        <input
          type="text"
          placeholder="e.g. color, zipper, foam, etc..."
          value={attributeSearchTerm}
          onChange={(e) => setAttributeSearchTerm(e.target.value)}
          className="search-input green-border"
        />

        {attributeFiltered.length > 0 && (
          <p><strong>{attributeFiltered.length} result(s) found:</strong></p>
        )}

        <ul>
          {attributeFiltered.map((item, idx) => (
            <li key={idx}>
              <p><strong className="highlight-sku">SKU:</strong> {item.sku}</p>
              {item.attributes.map((attr, i) => (
                <div key={i} style={{ marginLeft: '1rem' }}>
                  <p><strong>Attribute:</strong> {attr.attr}</p>
                  <p><strong>Value:</strong> {attr.val}</p>
                </div>
              ))}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
