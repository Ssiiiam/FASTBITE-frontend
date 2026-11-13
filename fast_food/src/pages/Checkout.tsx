import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import "./Checkout.css";

interface RestaurantTable {
  id: number;
  table_number: number;
  capacity: number;
  status: "available" | "occupied" | "reserved";
}

type PaymentMethod = "online" | "cash";

interface OrderResponse {
  order: {
    id: number;
    total_price: number | string;
  };
}

interface PaymentResponse {
  payment: {
    id: number;
    status: string;
  };
}

interface StartPaymentResponse {
  payment_url: string;
}

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("online");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const restaurantTable: RestaurantTable | null = (() => {
    try {
      const savedTable = sessionStorage.getItem("restaurantTable");

      if (!savedTable) return null;

      return JSON.parse(savedTable) as RestaurantTable;
    } catch {
      return null;
    }
  })();

  const isRestaurantMode = Boolean(restaurantTable);
  const orderType = isRestaurantMode ? "in_person" : "online";

  const subtotal = cartItems.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0,
  );

  const deliveryFee = isRestaurantMode ? 0 : 50000;
  const totalPrice = subtotal + deliveryFee;

  const handleSubmit = async () => {
    setError("");

    if (loading) return;

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!isRestaurantMode) {
      if (!recipientName.trim()) {
        setError("Recipient name is required.");
        return;
      }

      if (!recipientPhone.trim()) {
        setError("Recipient phone is required.");
        return;
      }

      if (!deliveryAddress.trim()) {
        setError("Delivery address is required.");
        return;
      }

      if (!postalCode.trim()) {
        setError("Postal code is required.");
        return;
      }

      if (paymentMethod !== "online") {
        setError("Online delivery orders must be paid online.");
        return;
      }
    }

    if (isRestaurantMode && !restaurantTable) {
      setError("Restaurant table information is missing.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create the order.
      const orderResponse = await api.post<OrderResponse>("/orders", {
        order_type: orderType,
        delivery_address: isRestaurantMode ? null : deliveryAddress.trim(),
        postal_code: isRestaurantMode ? null : postalCode.trim(),
        recipient_name: isRestaurantMode ? null : recipientName.trim(),
        recipient_phone: isRestaurantMode ? null : recipientPhone.trim(),
        table_id: restaurantTable?.id,
        items: cartItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
      });

      const orderId = orderResponse.data.order.id;

      // 2. Create the payment.
      const paymentResponse = await api.post<PaymentResponse>("/payments", {
        order_id: orderId,
        payment_method: paymentMethod,
      });

      const paymentId = paymentResponse.data.payment.id;

      // 3. Handle online payment.
      if (paymentMethod === "online") {
        const isTestMode =
          import.meta.env.VITE_PAYMENT_TEST_MODE === "true";

        if (isTestMode) {
          // Simulate a successful payment through the protected
          // backend development-only test endpoint.
          await api.post(`/payments/${paymentId}/test`);

          await clearCart();
          if (isRestaurantMode) {
            sessionStorage.removeItem("restaurantCart");
          }

          navigate(`/orders/${orderId}`);
          return;
        }

        // Real Zarinpal payment flow.
        const startResponse = await api.post<StartPaymentResponse>(
          `/payments/${paymentId}/start`,
        );

        const paymentUrl = startResponse.data.payment_url;

        if (
          !paymentUrl ||
          !/^https:\/\/(sandbox\.|www\.)?zarinpal\.com\//i.test(paymentUrl)
        ) {
          throw new Error("The payment gateway returned an invalid URL.");
        }

        // Clear the cart only after a valid payment URL is received.
        await clearCart();

        if (isRestaurantMode) {
          sessionStorage.removeItem("restaurantCart");
        }

        window.location.assign(paymentUrl);
        return;
      }

      // 4. Cash payment is available only for in-person orders.
      await clearCart();

      if (isRestaurantMode) {
        sessionStorage.removeItem("restaurantCart");
      }

      navigate(`/orders/${orderId}`);
    } catch (caughtError) {
      console.error("Checkout error:", caughtError);

      if (axios.isAxiosError(caughtError)) {
        console.error("HTTP STATUS:", caughtError.response?.status);
        console.error("SERVER RESPONSE:", caughtError.response?.data);

        const serverMessage = caughtError.response?.data?.error;

        setError(
          typeof serverMessage === "string"
            ? serverMessage
            : "Unable to complete your order. Please try again.",
        );
      } else if (caughtError instanceof Error) {
        setError(caughtError.message);
      } else {
        setError("Unable to complete your order. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <main className="checkout-page">
        <div className="checkout-container">
          <h1>Checkout</h1>
          <p>Your cart is empty.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-container">
        <h1>Checkout</h1>

        {restaurantTable ? (
          <section>
            <h2>Restaurant Order</h2>
            <p>Table {restaurantTable.table_number}</p>
            <p>Capacity: {restaurantTable.capacity}</p>
          </section>
        ) : (
          <section>
            <h2>Delivery Information</h2>

            <input
              type="text"
              placeholder="Recipient name"
              value={recipientName}
              onChange={(event) => setRecipientName(event.target.value)}
            />

            <input
              type="tel"
              placeholder="Phone number"
              value={recipientPhone}
              onChange={(event) => setRecipientPhone(event.target.value)}
            />

            <input
              type="text"
              placeholder="Delivery address"
              value={deliveryAddress}
              onChange={(event) => setDeliveryAddress(event.target.value)}
            />

            <input
              type="text"
              placeholder="Postal code"
              value={postalCode}
              onChange={(event) => setPostalCode(event.target.value)}
            />
          </section>
        )}

        <section>
          <h2>Payment Method</h2>

          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="online"
              checked={paymentMethod === "online"}
              onChange={() => setPaymentMethod("online")}
            />
            Online Payment
          </label>
          {isRestaurantMode && (
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={paymentMethod === "cash"}
                onChange={() => setPaymentMethod("cash")}
              />
              Cash
            </label>
          )}
        </section>

        <section>
          <h2>Order Summary</h2>
          <p>Subtotal: {subtotal.toLocaleString()} T</p>
          <p>Delivery: {deliveryFee.toLocaleString()} T</p>
          <strong>Total: {totalPrice.toLocaleString()} T</strong>
        </section>

        {error && (
          <p role="alert" style={{ color: "red" }}>
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={loading}
        >
          {loading
            ? "Processing..."
            : paymentMethod === "cash"
              ? "Place Order"
              : "Continue to Payment"}
        </button>
      </div>
    </main>
  );
}

export default Checkout;
