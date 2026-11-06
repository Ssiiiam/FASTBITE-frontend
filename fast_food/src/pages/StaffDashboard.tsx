import { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import api from "../api/axios";
import "./StaffDashboard.css";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "delivered"
  | "cancelled";

type OrderType = "online" | "in_person";

interface StaffOrder {
  id: number;
  user_id: number;
  customer_name: string;
  total_price: number;
  delivery_address: string | null;
  order_type: OrderType;
  status: OrderStatus;
  created_at: string;
}

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "confirmed",
  confirmed: "preparing",
  preparing: "ready",
  ready: "delivered",
};

function StaffDashboard() {
  const [orders, setOrders] = useState<StaffOrder[]>([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSuccessMessage = (message: string) => {
    setSuccess(message);
    setShowSuccess(true);

    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
    }

    successTimerRef.current = setTimeout(() => {
      setShowSuccess(false);
      setSuccess("");
      successTimerRef.current = null;
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  const loadOrders = async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError("");

    try {
      const response = await api.get("/staff/orders");
      setOrders(response.data.orders);
    } catch (err: unknown) {
      console.error(err);

      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else if (axios.isAxiosError(err) && err.response?.status === 403) {
        setError("You do not have permission to access staff orders.");
      } else {
        setError("Failed to load orders. Please try again.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    const fetchInitialOrders = async () => {
      try {
        setError("");

        const response = await api.get("/staff/orders");

        if (!ignore) {
          setOrders(response.data.orders);
        }
      } catch (err: unknown) {
        console.error(err);

        if (!ignore) {
          if (axios.isAxiosError(err) && err.response?.status === 401) {
            setError("Your session has expired. Please log in again.");
          } else if (axios.isAxiosError(err) && err.response?.status === 403) {
            setError("You do not have permission to access staff orders.");
          } else {
            setError("Failed to load orders. Please try again.");
          }
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void fetchInitialOrders();

    return () => {
      ignore = true;
    };
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesType =
        typeFilter === "all" || order.order_type === typeFilter;

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      return matchesType && matchesStatus;
    });
  }, [orders, typeFilter, statusFilter]);

  const updateStatus = async (orderId: number, status: OrderStatus) => {
    try {
      setUpdatingId(orderId);
      setError("");
      setSuccess("");

      await api.patch(`/orders/${orderId}/status`, { status });

      showSuccessMessage(`Order #${orderId} status updated successfully.`);
      await loadOrders();
    } catch (err: unknown) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.error ??
            "Failed to update order status. Please try again.",
        );
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const formatPrice = (price: number) =>
    `${new Intl.NumberFormat("en-US").format(price)} Toman`;

  const formatDate = (date: string) => new Date(date).toLocaleString("en-GB");

  return (
    <main className="staff-dashboard">
      <header className="staff-dashboard__header">
        <div>
          <h1>FASTBITE Staff Dashboard</h1>
          <p>Manage restaurant orders and update their progress.</p>
        </div>

        <button
          type="button"
          onClick={() => void loadOrders()}
          disabled={loading || refreshing}
        >
          {refreshing ? "Refreshing..." : "Refresh Orders"}
        </button>
      </header>

      <section className="staff-dashboard__filters">
        <label>
          Order Type
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
          >
            <option value="all">All Orders</option>
            <option value="online">Online Orders</option>
            <option value="in_person">In-Person Orders</option>
          </select>
        </label>

        <label>
          Order Status
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All Statuses</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </section>

      {error && (
        <div className="staff-dashboard__message staff-dashboard__message--error">
          {error}
        </div>
      )}

      {success && (
        <div
          className={`success-message ${showSuccess ? "show" : "hide"}`}
          role="status"
          aria-live="polite"
        >
          {success}
        </div>
      )}

      {loading ? (
        <p className="staff-dashboard__loading">Loading orders...</p>
      ) : filteredOrders.length === 0 ? (
        <p className="staff-dashboard__empty">No orders found.</p>
      ) : (
        <section className="staff-dashboard__orders">
          {filteredOrders.map((order) => {
            const isPendingInPerson =
              order.order_type === "in_person" && order.status === "pending";
            const followingStatus = isPendingInPerson
              ? "confirmed"
              : nextStatus[order.status];

            return (
              <article className="staff-order-card" key={order.id}>
                <div className="staff-order-card__header">
                  <h2>Order #{order.id}</h2>

                  <span
                    className={`staff-order-card__status staff-order-card__status--${order.status}`}
                  >
                    {statusLabels[order.status]}
                  </span>
                </div>

                <div className="staff-order-card__details">
                  <p>
                    <strong>Customer:</strong> {order.customer_name}
                  </p>

                  <p>
                    <strong>Order Type:</strong>{" "}
                    {order.order_type === "in_person" ? "In-Person" : "Online"}
                  </p>

                  <p>
                    <strong>Total:</strong> {formatPrice(order.total_price)}
                  </p>

                  {order.delivery_address && (
                    <p>
                      <strong>Delivery Address:</strong>{" "}
                      {order.delivery_address}
                    </p>
                  )}

                  <p>
                    <strong>Created At:</strong> {formatDate(order.created_at)}
                  </p>
                </div>
                {followingStatus && (
                  <button
                    type="button"
                    className="staff-order-card__action"
                    disabled={updatingId === order.id}
                    onClick={() => void updateStatus(order.id, followingStatus)}
                  >
                    {updatingId === order.id
                      ? "Updating..."
                      : isPendingInPerson
                        ? "Confirm Order"
                        : `Mark as ${statusLabels[followingStatus!]}`}
                  </button>
                )}
              </article>
            );
          })}
        </section>
      )}

      <footer className="staff-dashboard__footer">
        Showing {filteredOrders.length} of {orders.length} orders
      </footer>
    </main>
  );
}

export default StaffDashboard;
