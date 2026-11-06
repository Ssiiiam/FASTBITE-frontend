import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import "./ProductDetails.css";

interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  is_available: boolean;
  category_name: string;
}

function ProductDetails() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    const getProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);

        console.log("Product details response:", response.data);

        setProduct(response.data[0]);
      } catch (error) {
        console.error(error);
        setError("Failed to load product.");
      } finally {
        setLoading(false);
      }
    };

    getProduct();
  }, [id]);

  if (loading) {
    return <h2 className="product-details-message">Loading product...</h2>;
  }

  if (error) {
    return <h2 className="product-details-message">{error}</h2>;
  }

  if (!product) {
    return <h2 className="product-details-message">Product not found.</h2>;
  }

  return (
    <main className="product-details-page">
      <div className="product-details-image">
        <img
          src={`/images/${product.image_url}`}
          alt={product.name}
        />
      </div>

      <div className="product-details-info">
        <span className="product-details-category">
          {product.category_name}
        </span>

        <h1>{product.name}</h1>

        <p className="product-details-description">
          A delicious meal made fresh for you.
        </p>

        <div className="product-details-price">
          {product.price.toLocaleString()} T
        </div>

        {!product.is_available && (
          <p className="product-unavailable">
            Currently unavailable
          </p>
        )}

        <button
          className="add-to-cart-button"
          disabled={!product.is_available}
          onClick={async() => {
            if (!user) {
              navigate("/login");
              return;
            }
            await addToCart(product);
          }}
        >
          Add to Cart
        </button>
      </div>
    </main>
  );
}

export default ProductDetails;