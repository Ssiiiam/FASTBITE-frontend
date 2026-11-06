import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import "./OrderDetails.css";

interface Order {
  id: number;
  total_price: number;
  delivery_address: string | null;
  postal_code: string | null;
  recipient_name: string | null;
  recipient_phone: string | null;
  delivery_fee: number;
  order_type: "online" | "in_person";
  status: string;
  created_at: string;
}

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface Payment {
  id: number;
  amount: number;
  payment_method: string;
  status: string;
  paid_at: string | null;
  created_at: string;
}

interface OrderDetailsResponse {
  order: Order;
  items: OrderItem[];
  payment: Payment | null;
}

export default function OrderDetails() {
  const { id } = useParams();

  const [order, setOrder] = useState<OrderDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`);

        setOrder(response.data);
      } catch (error) {
        console.error("Failed to load order:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchOrder();
  }, [id]);

  if (loading) {
    return <p>Loading order...</p>;
  }

  if (!order) {
    return <p>Order not found.</p>;
  }

  const handleCreatePayment = async (paymentMethod: "online" | "cash") => {
    try {
      const response = await api.post("/payments", {
        order_id: order.order.id,
        payment_method: paymentMethod,
      });

      setOrder({
        ...order,
        payment: response.data.payment,
      });
    } catch (error) {
      console.error("Failed to create payment:", error);
    }
  };
  
  return (
    <main className="order-details-page">
      <div className="order-details-container">
        <h1>Order #{order.order.id}</h1>

        <section className="order-details-section">
          <h2>Order Information</h2>
          <p>Status: {order.order.status}</p>
          <p>Order type: {order.order.order_type}</p>
          <p>Date: {order.order.created_at}</p>
        </section>

        <section className="order-details-section">
          <h2>Items</h2>
          {order.items.map((item) => (
            <div key={item.id} className="order-item">
              <p>{item.product_name}</p>
              <p>Quantity: {item.quantity}</p>
              <p>Unit price: {item.unit_price}</p>
              <p>Subtotal: {item.subtotal}</p>
            </div>
          ))}
        </section>

        {order.order.order_type === "online" && (
          <section className="order-details-section">
            <h2>Delivery Information</h2>
            <p>Recipient: {order.order.recipient_name}</p>
            <p>Phone: {order.order.recipient_phone}</p>
            <p>Address: {order.order.delivery_address}</p>
            <p>Postal code: {order.order.postal_code}</p>
          </section>
        )}

        <section className="order-details-section">
          <h2>Payment</h2>

          {order.payment ? (
            <>
              <p>Method: {order.payment.payment_method}</p>
              <p>Status: {order.payment.status}</p>
              <p>Amount: {order.payment.amount}</p>
            </>
          ) : (
            <div className="order-payment-actions">
              <p>Payment has not been created yet.</p>
              <button onClick={() => handleCreatePayment("online")}>
                Pay Online
              </button>
              <button onClick={() => handleCreatePayment("cash")}>
                Pay Cash
              </button>
            </div>
          )}
        </section>

        <section className="order-details-section order-total-section">
          <p>Delivery fee: {order.order.delivery_fee}</p>
          <strong>Total: {order.order.total_price}</strong>
        </section>
      </div>
    </main>
  );
}
