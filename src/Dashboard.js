'use client';

import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('https://github.com/takakurka/jtl-dash/raw/refs/heads/main/JTL_dashboard.csv');
      const reader = response.body.getReader();
      const result = await reader.read(); 
      const decoder = new TextDecoder('utf-8');
      const csv = decoder.decode(result.value); 
      const results = Papa.parse(csv, { header: true });
      setData(results.data);
    };

    fetchData();
  }, []);

  // Filtrowanie i grupowanie danych
  const filteredData = data.filter((row) => {
    const search = searchTerm.toLowerCase();
    return (
      row['SKU']?.toLowerCase().includes(search) ||
      row['Item name']?.toLowerCase().includes(search)
    );
  });

  // Grupowanie po SKU
  const groupedData = filteredData.reduce((acc, row) => {
    const sku = row['SKU'];
    if (!acc[sku]) acc[sku] = { itemName: row['Item name'], rows: [] };
    acc[sku].rows.push(row);
    return acc;
  }, {});

  // Ignorowane kolumny
  const ignoredAttributes = ['tags', 'template_suffix'];
  const ignoredPrefixes = ['meta_'];

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-4">JTL Produkt-Dashboard</h1>
      <input
        type="text"
        placeholder="Szukaj po SKU lub nazwie..."
        className="p-2 border border-black rounded w-full mb-6 text-black"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {Object.keys(groupedData).length === 0 ? (
        <p>
          Nie znaleziono produktu pasującego do: <strong>{searchTerm}</strong>
        </p>
      ) : (
        Object.entries(groupedData).map(([sku, group]) => (
          <div key={sku} className="mb-10 border-t pt-6">
            <h2 className="text-xl font-bold mb-2">SKU: {sku}</h2>
            <p className="text-lg mb-2">Nazwa: <strong>{group.itemName}</strong></p>
            <div className="overflow-auto">
              <table className="min-w-full border border-black">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-black p-2">Attribute name</th>
                    <th className="border border-black p-2">Wartość</th>
                  </tr>
                </thead>
                <tbody>
                  {group.rows
                    .filter((row) => {
                      const attr = row['Attribute name'] || '';
                      return (
                        !ignoredAttributes.includes(attr) &&
                        !ignoredPrefixes.some((prefix) => attr.startsWith(prefix))
                      );
                    })
                    .map((row, index) => (
                      <tr key={index}>
                        <td className="border border-black p-2">{row['Attribute name']}</td>
                        <td className="border border-black p-2">{row['Wert']}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
