import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import './dashboard.css';

const CSV_URL = 'https://cdn.jsdelivr.net/gh/takakurka/jtl-dash@main/JTL_dashboard.csv';

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [attributeSearch, setAttributeSearch] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [attributeResults, setAttributeResults] = useState([]);

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

  useEffect(() => {
    if (!attributeSearch) {
      setAttributeResults([]);
      return;
    }
    const term = attributeSearch.toLowerCase();
    const grouped = {};

    data.forEach((item) => {
      const sku = item.SKU;
      const attr = item['Attribute name'];
      const val = item['Attribute value'];

      if (
        sku &&
        !sku.endsWith('-0') &&
        attr &&
        val &&
        !attr.startsWith('meta_') &&
        !['tags', 'template_suffix', 'barcode_type', 'active', 'product_type'].includes(attr) &&
        (attr.toLowerCase().includes(term) || val.toLowerCase().includes(term))
      ) {
        if (!grouped[sku]) grouped[sku] = [];
        grouped[sku].push({ attr, val });
      }
    });

    const resultArray = Object.entries(grouped).map(([sku, attributes]) => ({ sku, attributes }));
    setAttributeResults(resultArray);
  }, [attributeSearch, data]);

  return (
    <div className="dashboard">
      <h1>JTL Product Dashboard</h1>
      <input
        type="text"
        placeholder="Search by SKU or Item Name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />

      {filteredItems.map((item, idx) => (
        <div key={idx} className="product-block">
          <p><strong className="sku-label">SKU:</strong> {item.sku}</p>
          <p><strong>Name:</strong> {item.name}</p>
          <table>
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

      <h2>Search by Attribute</h2>
      <input
        type="text"
        placeholder="Search by Attribute..."
        value={attributeSearch}
        onChange={(e) => setAttributeSearch(e.target.value)}
        className="search-bar"
      />

      {attributeResults.length > 0 && (
        <p><strong>{attributeResults.length} result(s) found:</strong></p>
      )}

      {attributeResults.map((item, idx) => (
        <div key={idx} className="attribute-block">
          <p><strong className="sku-label">SKU:</strong> {item.sku}</p>
          <ul>
            {item.attributes.map((attr, i) => (
              <li key={i}><strong>Attribute:</strong> {attr.attr}<br /><strong>Value:</strong> {attr.val}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
