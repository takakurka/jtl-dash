import React, { useState, useEffect } from 'react';
import './Dashboard.css';

function Dashboard({ data }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [attributeTerm, setAttributeTerm] = useState('');

  const filteredBySKU = data.filter(
    (item) =>
      item.SKU.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const attributeMatches = data
    .flatMap((item) => {
      return item.Attributes.map((attr) => ({
        SKU: item.SKU,
        Name: item.Name,
        Attribute: attr.Attribute,
        Value: attr.Value,
      }));
    })
    .filter(
      (entry) =>
        entry.Attribute.toLowerCase().includes(attributeTerm.toLowerCase()) ||
        entry.Value.toLowerCase().includes(attributeTerm.toLowerCase())
    );

  const groupedAttributes = attributeMatches.reduce((acc, item) => {
    if (!acc[item.SKU]) {
      acc[item.SKU] = {
        Name: item.Name,
        Attributes: [],
      };
    }
    acc[item.SKU].Attributes.push({
      Attribute: item.Attribute,
      Value: item.Value,
    });
    return acc;
  }, {});

  return (
    <div className="dashboard">
      <h1>JTL Product Dashboard</h1>

      <input
        type="text"
        placeholder="Search by SKU or Item Name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      {searchTerm &&
        filteredBySKU.map((item) => (
          <div key={item.SKU} className="product-card">
            <div className="sku">SKU: <span>{item.SKU}</span></div>
            <div className="name">Name: <strong>{item.Name}</strong></div>
            <table>
              <thead>
                <tr>
                  <th>Attribute</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {item.Attributes.map((attr, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'even' : 'odd'}>
                    <td>{attr.Attribute}</td>
                    <td>{attr.Value}</td>
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
          placeholder="e.g. color, memory foam, etc."
          value={attributeTerm}
          onChange={(e) => setAttributeTerm(e.target.value)}
          className="search-input"
        />
        {attributeTerm && (
          <div className="results">
            <p>
              {Object.keys(groupedAttributes).length} result(s) found:
            </p>
            {Object.entries(groupedAttributes).map(([sku, group]) => (
              <div key={sku} className="product-card">
                <div className="sku">SKU: <span>{sku}</span></div>
                <div className="name">Name: <strong>{group.Name}</strong></div>
                <table>
                  <thead>
                    <tr>
                      <th>Attribute</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.Attributes.map((attr, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'even' : 'odd'}>
                        <td>{attr.Attribute}</td>
                        <td>{attr.Value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
