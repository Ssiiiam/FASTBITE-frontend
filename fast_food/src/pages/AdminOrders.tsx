import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./AdminOrders.css";

interface AdminOrder {
  id: number;
  customer_name: string;
  total_price: number;
  delivery_address: string | null;
  order_type: "online" | "in_person";
  status: string;
  delivery_fee: number;
  created_at: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get<AdminOrder[]>("/admin/orders");
        setOrders(response.data);
      } catch (error) {
        console.error("Failed to load admin orders:", error);
        setError("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    void fetchOrders();
  }, []);

  if (loading) {
    return (
      <main className="admin-orders-page">
        <p className="admin-orders-message">Loading orders...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="admin-orders-page">
        <p className="admin-orders-message admin-orders-error" role="alert">
          {error}
        </p>
      </main>
    );
  }

  return (
    <main className="admin-orders-page">
      <div className="admin-orders-container">
        <header className="admin-orders-header">
          <span className="admin-orders-label">FASTBITE MANAGEMENT</span>
          <h1>Manage Orders</h1>
          <p>View and manage all restaurant orders.</p>
        </header>

        <div className="admin-orders-summary">
          <div>
            <span>Total Orders</span>
            <strong>{orders.length}</strong>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="admin-orders-empty">
            <span className="admin-orders-empty-icon">📦</span>
            <h2>No Orders Found</h2>
            <p>New orders will appear here when customers place them.</p>
          </div>
        ) : (
          <section className="admin-orders-list">
            {orders.map((order) => (
              <article className="admin-order-card" key={order.id}>
                <div className="admin-order-top">
                  <div>
                    <span className="admin-order-number">ORDER</span>
                    <h2>#{order.id}</h2>
                  </div>

                  <span className="admin-order-status">
                    {order.status.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="admin-order-details">
                  <div className="admin-order-detail">
                    <span>Customer</span>
                    <strong>{order.customer_name}</strong>
                  </div>

                  <div className="admin-order-detail">
                    <span>Order Type</span>
                    <strong>
                      {order.order_type === "in_person"
                        ? "In Person"
                        : "Online"}
                    </strong>
                  </div>

                  <div className="admin-order-detail">
                    <span>Total Price</span>
                    <strong className="admin-order-total">
                      {Number(order.total_price).toLocaleString()} T
                    </strong>
                  </div>

                  <div className="admin-order-detail">
                    <span>Delivery Fee</span>
                    <strong>
                      {Number(order.delivery_fee).toLocaleString()} T
                    </strong>
                  </div>

                  <div className="admin-order-detail admin-order-address">
                    <span>Delivery Address</span>
                    <strong>
                      {order.delivery_address ?? "Not applicable"}
                    </strong>
                  </div>
                  <div className="admin-order-detail">
                    <span>Date</span>
                    <strong>
                      {new Date(order.created_at).toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div className="admin-order-footer">
                  <button onClick={() => navigate(`/admin/orders/${order.id}`)}>
                    View Details & History
                    <span>→</span>
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
