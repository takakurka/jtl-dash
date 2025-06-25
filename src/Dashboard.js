import React, { useState } from 'react';
import './Dashboard.css';

function Dashboard({ data }) {
  const [skuSearch, setSkuSearch] = useState('');
  const [attributeSearch, setAttributeSearch] = useState('');

  const filteredBySKU = data.filter(item =>
    item.SKU.toLowerCase().includes(skuSearch.toLowerCase()) ||
    item.Name.toLowerCase().includes(skuSearch.toLowerCase())
  );

  const groupedAttributes = data.reduce((acc, item) => {
    if (
      item.Attribute.toLowerCase().includes(attributeSearch.toLowerCase())
    ) {
      if (!acc[item.SKU]) acc[item.SKU] = { name: item.Name, attributes: [] };
      acc[item.SKU].attributes.push({
        attribute: item.Attribute,
        value: item.Value,
      });
    }
    return acc;
  }, {});

  return (
    <div className="dashboard">
      <h1>JTL Product Dashboard</h1>

      <input
        type="text"
        placeholder="Search by SKU or Item Name..."
        value={skuSearch}
        onChange={e => setSkuSearch(e.target.value)}
        className="search-input"
      />

      {skuSearch && filteredBySKU.map(item => (
        <div key={item.SKU} className="product-card">
          <div className="product-sku">SKU: <span>{item.SKU}</span></div>
          <div className="product-name">Name: <strong>{item.Name}</strong></div>
          <table>
            <thead>
              <tr>
                <th>Attribute</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {item.Attributes.map((attr, index) => (
                <tr key={index}>
                  <td>{attr.Attribute}</td>
                  <td>{attr.Value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <h3>Search by Attribute</h3>
      <input
        type="text"
        placeholder="e.g. color"
        value={attributeSearch}
        onChange={e => setAttributeSearch(e.target.value)}
        className="search-input"
      />

      {attributeSearch && (
        <div>
          <p><strong>{Object.keys(groupedAttributes).length} SKU(s) found:</strong></p>
          {Object.entries(groupedAttributes).map(([sku, data]) => (
            <div key={sku} className="product-card">
              <div className="product-sku">SKU: <span>{sku}</span></div>
              <div className="product-name">Name: <strong>{data.name}</strong></div>
              <table>
                <thead>
                  <tr>
                    <th>Attribute</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {data.attributes.map((attr, index) => (
                    <tr key={index}>
                      <td>{attr.attribute}</td>
                      <td>{attr.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
