import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import './Dashboard.css';

const CSV_URL = 'https://cdn.jsdelivr.net/gh/takakurka/jtl-dash@main/JTL_dashboard.csv';

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [skuSearch, setSkuSearch] = useState('');
  const [attrSearch, setAttrSearch] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [attributeMatches, setAttributeMatches] = useState([]);

  const IGNORED_ATTRIBUTES = ['tags', 'template_suffix', 'barcode_type', 'active', 'product_type'];

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
    if (!skuSearch) {
      setFilteredItems([]);
      return;
    }
    const term = skuSearch.toLowerCase();
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
        !IGNORED_ATTRIBUTES.includes(attr)
      ) {
        grouped[sku].attributes.push({ attr, val });
      }
    });

    setFilteredItems(Object.values(grouped));
  }, [skuSearch, data]);

  useEffect(() => {
    if (!attrSearch) {
      setAttributeMatches([]);
      return;
    }
    const term = attrSearch.toLowerCase();
    const filtered = data.filter((item) => {
      const attr = item['Attribute name'];
      const val = item['Attribute value'];
      const sku = item.SKU;
      return (
        sku &&
        !sku.endsWith('-0') &&
        attr &&
        val &&
        !attr.startsWith('meta_') &&
        !IGNORED_ATTRIBUTES.includes(attr) &&
        (attr.toLowerCase().includes(term) || val.toLowerCase().includes(term))
      );
    });

    const grouped = {};
    filtered.forEach((item) => {
      const sku = item.SKU;
      const attr = item['Attribute name'];
      const val = item['Attribute value'];

      if (!grouped[sku]) {
        grouped[sku] = {
          sku,
          attributes: [],
        };
      }

      grouped[sku].attributes.push({ attr, val });
    });

    setAttributeMatches(Object.values(grouped));
  }, [attrSearch, data]);

  return (
    <div className="dashboard-container">
      <h1>JTL Product Dashboard</h1>

      <input
        type="text"
        placeholder="Search by SKU or Item Name..."
        value={skuSearch}
        onChange={(e) => setSkuSearch(e.target.value)}
        className="search-input"
      />

      {filteredItems.map((item, idx) => (
        <div key={idx} className="product-block">
          <p>
            <strong className="sku-highlight">SKU:</strong> {item.sku}
          </p>
          <p>
            <strong>Name:</strong> {item.name}
          </p>
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

      <h3>Search by Attribute</h3>
      <input
        type="text"
        placeholder="Search by attribute name or value..."
        value={attrSearch}
        onChange={(e) => setAttrSearch(e.target.value)}
        className="search-input attribute-search"
      />

      {attributeMatches.length > 0 && (
        <p style={{ marginTop: '0.5rem' }}>
          {attributeMatches.length} result(s) found:
        </p>
      )}
      {attributeMatches.map((item, idx) => (
        <div key={idx} className="product-block">
          <p>
            <strong className="sku-highlight">SKU:</strong> {item.sku}
          </p>
          <ul>
            {item.attributes.map((attr, i) => (
              <li key={i}>
                <strong>Attribute:</strong> {attr.attr} <br />
                <strong>Value:</strong> {attr.val}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
