import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Orders.css";

interface Order {
  id: number;
  status: string;
  total_price: number;
  order_type: string;
  delivery_fee: number;
  created_at: string;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders");
        console.log("orders response:", response.data);

        setOrders(response.data);
      } catch (error) {
        console.error("Failed to load orders:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchOrders();
  }, []);

  if (loading) {
    return <p className="orders-message">Loading orders ...</p>;
  }

  if (orders.length === 0) {
    return <p className="orders-message">You dont have any orders yet.</p>;
  }
  return (
    <main className="orders-page">
      <div className="orders-container">
        <h1>My Orders</h1>

        <div className="orders-grid">
          {orders.map((order) => (
            <article className="order-card" key={order.id}>
              <h2>Order #{order.id}</h2>

              <p>
                Status: <strong>{order.status}</strong>
              </p>

              <p>
                Type: <strong>{order.order_type}</strong>
              </p>

              <p>
                Delivery fee:{" "}
                <strong>{(order.delivery_fee ?? 0).toLocaleString()} T</strong>
              </p>

              <p>
                Date:{" "}
                <strong>
                  {new Date(order.created_at).toLocaleDateString()}
                </strong>
              </p>

              <p className="order-total">
                Total: <strong>{order.total_price.toLocaleString()} T</strong>
              </p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
