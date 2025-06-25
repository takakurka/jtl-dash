import React, { useState } from 'react';
import './Dashboard.css';

function Dashboard({ data }) {
  const [skuSearch, setSkuSearch] = useState('');
  const [attributeSearch, setAttributeSearch] = useState('');

  const filteredBySKU = data.filter(
    (item) =>
      item.sku.toLowerCase().includes(skuSearch.toLowerCase()) ||
      item.name.toLowerCase().includes(skuSearch.toLowerCase())
  );

  const filteredByAttribute = data.filter(
    (item) =>
      item.attribute &&
      item.attribute.toLowerCase().includes(attributeSearch.toLowerCase())
  );

  const groupedAttributes = filteredByAttribute.reduce((acc, curr) => {
    if (!acc[curr.sku]) {
      acc[curr.sku] = {
        sku: curr.sku,
        attributes: [],
      };
    }
    acc[curr.sku].attributes.push({
      attribute: curr.attribute,
      value: curr.value,
    });
    return acc;
  }, {});

  return (
    <div className="dashboard">
      <h1>JTL Product Dashboard</h1>

      <input
        type="text"
        placeholder="Search by SKU or Item Name..."
        value={skuSearch}
        onChange={(e) => setSkuSearch(e.target.value)}
      />

      {skuSearch && (
        <>
          {filteredBySKU.map((item, index) => (
            <div className="product-card" key={index}>
              <div className="sku-label">SKU: <span>{item.sku}</span></div>
              <div className="product-name"><strong>Name:</strong> {item.name}</div>
              <table className="product-table">
                <thead>
                  <tr>
                    <th>Attribute</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {item.attributes &&
                    item.attributes.map((att, i) => (
                      <tr key={i}>
                        <td>{att.attribute}</td>
                        <td>{att.value}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ))}
        </>
      )}

      <h3>Search by Attribute</h3>
      <input
        type="text"
        placeholder="e.g. color, material, zipper..."
        value={attributeSearch}
        onChange={(e) => setAttributeSearch(e.target.value)}
      />

      {attributeSearch && (
        <div className="attribute-results">
          <p><strong>{filteredByAttribute.length} result(s) found:</strong></p>
          {Object.entries(groupedAttributes).map(([sku, { attributes }]) => (
            <div className="attribute-group" key={sku}>
              <div className="sku-label">SKU: <span>{sku}</span></div>
              <ul>
                {attributes.map((att, idx) => (
                  <li key={idx}>
                    <strong>Attribute:</strong> {att.attribute} <br />
                    <strong>Value:</strong> {att.value}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
