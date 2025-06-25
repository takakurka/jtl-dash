import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import './Dashboard.css';

const CSV_URL =
  'https://cdn.jsdelivr.net/gh/takakurka/jtl-dash@main/JTL_dashboard.csv';

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
  const [attributeTerm, setAttributeTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [attributeMatches, setAttributeMatches] = useState([]);

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
        !IGNORED_ATTRIBUTES.includes(attr)
      ) {
        grouped[sku].attributes.push({ attr, val });
      }
    });

    setFilteredItems(Object.values(grouped));
  }, [searchTerm, data]);

  useEffect(() => {
    if (!attributeTerm) {
      setAttributeMatches([]);
      return;
    }
    const term = attributeTerm.toLowerCase();
    const matches = data.filter((item) => {
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
    matches.forEach((item) => {
      const sku = item.SKU;
      if (!grouped[sku]) {
        grouped[sku] = [];
      }
      grouped[sku].push({
        attr: item['Attribute name'],
        val: item['Attribute value'],
      });
    });
    setAttributeMatches(grouped);
  }, [attributeTerm, data]);

  return (
    <div className="dashboard-container">
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

      <div className="attribute-search">
        <h3>Search by Attribute</h3>
        <input
          type="text"
          placeholder="e.g. FBA, color, zipper..."
          value={attributeTerm}
          onChange={(e) => setAttributeTerm(e.target.value)}
          className="search-bar"
        />

        {Object.keys(attributeMatches).length > 0 && (
          <div className="search-results">
            <p><strong>{Object.keys(attributeMatches).length} result(s) found:</strong></p>
            {Object.entries(attributeMatches).map(([sku, attrs], idx) => (
              <div key={idx} className="product-block">
                <p>
                  <strong className="sku-highlight">SKU:</strong> {sku}
                </p>
                <ul>
                  {attrs.map((pair, i) => (
                    <li key={i}>
                      <strong>Attribute:</strong> {pair.attr}<br />
                      <strong>Value:</strong> {pair.val}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
