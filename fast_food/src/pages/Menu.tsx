import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import "./menu.css";

interface Table {
  id: number;
  table_number: number;
  capacity: number;
  status: "available" | "occupied" | "reserved";
}

interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  is_available: boolean;
}

export default function Menu() {
  console.log("FULL URL:", window.location.href);
  console.log("QUERY STRING:", window.location.search);

  const manualParams = new URLSearchParams(window.location.search);

  console.log("MANUAL TABLE:", manualParams.get("table"));
  const [searchParams] = useSearchParams();
  console.log("CURRENT URL:", window.location.href);
  console.log("SEARCH:", window.location.search);
  console.log("PARAM TABLE:", searchParams.get("table"));

  const tableToken = searchParams.get("table");

  const { addToCart } = useCart();

  const baseURL = api.defaults.baseURL ?? "";

  const imageBaseURL = baseURL.endsWith("/api")

    ? baseURL.slice(0, -4)
    : baseURL;

  const [table, setTable] = useState<Table | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(() => Boolean(tableToken));
  const [error, setError] = useState("");
  const [showLoginMessage, setShowLoginMessage] = useState(false);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        if (tableToken) {
          const tableResponse = await api.get(`/tables/qr/${tableToken}`);
          const detectedTable: Table = tableResponse.data.table;

          setTable(detectedTable);

          sessionStorage.setItem(
            "restaurantTable",
            JSON.stringify(detectedTable),
          );
        } else {
          setTable(null);
          sessionStorage.removeItem("restaurantTable");
        }

        const productsResponse = await api.get("/products");
        setProducts(productsResponse.data);
      } catch (error) {
        console.error("Failed to load menu:", error);
        setError("Unable to load the menu.");
      } finally {
        setLoading(false);
      }
    };

    void loadMenu();
  }, [tableToken]);

  const handleAddToCart = async (product: Product) => {
    const success = await addToCart(product);

    if (!success) {
      setShowLoginMessage(true);
      return;
    }
  };

  if (loading) {
    return <p>Loading menu...</p>;
  }

  if (error) {
    return (
      <div>
        <h1>Restaurant Menu</h1>

        <p>{error}</p>
      </div>
    );
  }
  return (
    <div className="menu-page">
      <header className="menu-header">
        <h1>Restaurant Menu</h1>

        {table && (
          <p>
            Table {table.table_number} · Capacity {table.capacity}
          </p>
        )}
      </header>

      <main className="menu-main">
        <h2>Our Menu</h2>

        <div className="menu-products">
          {products
            .filter((product) => product.is_available)
            .map((product) => (
              <article key={product.id} className="menu-product-card">
                <img
                  src={`${imageBaseURL}${product.image_url}`}
                  alt={product.name}
                />

                <div className="menu-product-info">
                  <h3>{product.name}</h3>

                  <p className="menu-product-price">
                    {product.price.toLocaleString()} Toman
                  </p>
                  <button
                    type="button"
                    onClick={() => void handleAddToCart(product) }
                  >
                    Add to Cart
                  </button>
                </div>
              </article>
            ))}
        </div>
      </main>
    </div>
  );
}
