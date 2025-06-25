import { useEffect, useState } from "react";

const SHEETDB_URL = 'https://sheetdb.io/api/v1/s3whprckk24jm';

function Dashboard() {
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch(SHEETDB_URL)
      .then((res) => res.json())
      .then((data) => {
        // SheetDB zwraca dane w obiekcie: { data: [...] }
        const rows = data?.data || [];

        // Filtruj meta_ w Attribute name
        const clean = rows.filter(row => !row["Attribute name"]?.startsWith("meta_"));

        // Grupuj po SKU
        const grouped = clean.reduce((acc, row) => {
          const sku = row["SKU"];
          if (!acc[sku]) {
            acc[sku] = {
              sku,
              name: row["Item name"],
              gtin: row["GTIN"],
              attributes: [],
            };
          }
          acc[sku].attributes.push({
            name: row["Attribute name"],
            value: row["Attribute value"]
          });
          return acc;
        }, {});

        setProducts(grouped);
        setLoading(false);
      });
  }, []);
