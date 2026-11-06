import {Link} from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Products.css";

interface Product {
  id: number;
  name: string;
  price: number;
  is_available: boolean;
  category_name: string;
}

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await api.get("/products");

        setProducts(response.data);
      } catch (error) {
        console.error(error);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, []);

  if (loading) {
    return <h2>Loading products...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  return (
    <main className="products-page">
      <div className="products-header">
        <p>OUR MENU</p>
        <h1>Choose Your Favorite</h1>
      </div>

      <div className="products-grid">
        {products.map((product) => (
          <Link to={`/products/${product.id}`}
          className="product-card" key={product.id}
          >
            <div className="product-image">
              🍔
            </div>

            <div className="product-info">
              <span>{product.category_name}</span>

              <h2>{product.name}</h2>

              <div className="product-bottom">
                <strong>{product.price.toLocaleString()} T</strong>

                <button>+</button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

export default Products;