import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./Cart.css";
import { useAuth } from "../context/AuthContext";

function Cart() {
  const { cartItems, removeFromCart, increaseQuantity, decreaseQuantity } =
    useCart();

  const navigate = useNavigate();
  const { user } = useAuth();

  const handleProceedToCheckout = () => {
    if (!user) {
      navigate("/login", {
        state: { from: "/checkout" },
      });
      return;
    }
    navigate("/checkout");
  };

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  if (cartItems.length === 0) {
    return (
      <main className="cart-page">
        <div className="empty-cart">
          <h1>Your Cart is Empty</h1>

          <p>Add some delicious food to your cart.</p>

          <Link to="/products" className="checkout">
            Browse Menu
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="cart-container">
        {/* Cart Items */}

        <div className="cart-items">
          <h1>Your Cart</h1>

          {cartItems.map((item) => (
            <div className="cart-item" key={item.id}>
              <div className="cart-item-image">
                <img src={`/images/${item.image_url}`} alt={item.name} />
              </div>

              <div className="cart-item-info">
                <h2>{item.name}</h2>

                <p>{item.price.toLocaleString()} T</p>

                <div className="quantity-controls">
                  <button
                    type="button"
                    onClick={() => decreaseQuantity(item.id)}
                  >
                    −
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    type="button"
                    onClick={() => increaseQuantity(item.id)}
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className="remove-item-button"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>
              </div>

              <div className="cart-item-total">
                {(item.price * item.quantity).toLocaleString()} T
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}

        <div className="cart-summary">
          <h2>Order Summary</h2>

          <div className="cart-summary-row">
            <span>Subtotal</span>

            <strong>{totalPrice.toLocaleString()} T</strong>
          </div>

          <div className="cart-summary-row">
            <span>Delivery</span>

            <strong>Calculated at checkout</strong>
          </div>

          <hr />

          <div className="cart-summary-total">
            <span>Total</span>

            <strong>{totalPrice.toLocaleString()} T</strong>
          </div>

          <button
            type="button"
            className="checkout-button"
            onClick={handleProceedToCheckout}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </main>
  );
}

export default Cart;
