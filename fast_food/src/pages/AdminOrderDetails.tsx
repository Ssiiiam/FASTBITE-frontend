import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import "./AdminOrderDetails.css";

interface AdminOrder {
  id: number;
  customer_name: string;
  total_price: number;
  delivery_address: string | null;
  order_type: string;
  status: string;
  delivery_fee: number;
  created_at: string;
}

interface OrderHistory {
  id: number;
  order_id: number;
  status: string;
  changed_at: string;
  changed_by: number | null;
  employee_name: string | null;
}

export default function AdminOrderDetails() {
  const { id } = useParams<{ id: string }>();

  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [history, setHistory] = useState<OrderHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
        setError("Invalid order ID.");
        setLoading(false);
        return;
      }

      try {
        const [ordersResponse, historyResponse] = await Promise.all([
          api.get<AdminOrder[]>("/admin/orders"),
          api.get<{ order_id: number; history: OrderHistory[] }>(
            `/orders/${id}/history`,
          ),
        ]);

        const foundOrder = ordersResponse.data.find(
          (item) => item.id === Number(id),
        );

        if (!foundOrder) {
          setError("Order not found.");
          return;
        }

        setOrder(foundOrder);
        setHistory(historyResponse.data.history);
      } catch (err) {
        console.error("Failed to load order details:", err);
        setError("Failed to load order details and history.");
      } finally {
        setLoading(false);
      }
    };

    void fetchOrderDetails();
  }, [id]);

  if (loading) {
    return (
      <main className="admin-order-details-page">
        <p className="admin-details-message">Loading order details...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="admin-order-details-page">
        <p className="admin-details-message admin-details-error" role="alert">
          {error}
        </p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="admin-order-details-page">
        <p className="admin-details-message">Order not found.</p>
      </main>
    );
  }

  return (
    <main className="admin-order-details-page">
      <div className="admin-order-details-container">
        <header className="admin-details-header">
          <span className="admin-details-label">ORDER MANAGEMENT</span>
          <h1>Order #{order.id}</h1>
          <p>Review order information and track its status history.</p>
        </header>

        <section className="admin-details-card">
          <div className="admin-details-card-header">
            <h2>Order Information</h2>
            <span className="admin-details-status">
              {order.status.replace(/_/g, " ")}
            </span>
          </div>

          <div className="admin-details-grid">
            <div className="admin-details-item">
              <span>Customer</span>
              <strong>{order.customer_name}</strong>
            </div>

            <div className="admin-details-item">
              <span>Order Type</span>
              <strong>
                {order.order_type === "in_person" ? "In Person" : "Online"}
              </strong>
            </div>

            <div className="admin-details-item">
              <span>Total Price</span>
              <strong className="admin-details-total">
                {Number(order.total_price).toLocaleString()} T
              </strong>
            </div>

            <div className="admin-details-item">
              <span>Delivery Fee</span>
              <strong>{Number(order.delivery_fee).toLocaleString()} T</strong>
            </div>
            <div className="admin-details-item admin-details-full">
              <span>Delivery Address</span>
              <strong>{order.delivery_address ?? "Not applicable"}</strong>
            </div>

            <div className="admin-details-item admin-details-full">
              <span>Order Date</span>
              <strong>{new Date(order.created_at).toLocaleString()}</strong>
            </div>
          </div>
        </section>

        <section className="admin-details-card admin-history-card">
          <div className="admin-details-card-header">
            <h2>Status History</h2>
            <span className="admin-history-count">
              {history.length} {history.length === 1 ? "Record" : "Records"}
            </span>
          </div>

          {history.length === 0 ? (
            <div className="admin-history-empty">
              <span>📋</span>
              <p>No status history available.</p>
            </div>
          ) : (
            <ol className="admin-history-timeline">
              {history.map((item) => (
                <li className="admin-history-item" key={item.id}>
                  <div className="admin-history-marker" />

                  <div className="admin-history-content">
                    <div className="admin-history-top">
                      <strong>{item.status.replace(/_/g, " ")}</strong>
                      <time>{new Date(item.changed_at).toLocaleString()}</time>
                    </div>

                    <p>
                      Changed by:{" "}
                      {item.employee_name ??
                        (item.changed_by === null
                          ? "System or unknown"
                          : `User #${item.changed_by}`)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </main>
  );
}
