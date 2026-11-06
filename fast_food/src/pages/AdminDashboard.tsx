import { Link } from "react-router-dom";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  return (
    <main className="admin-dashboard">
      <div className="admin-dashboard-header">
        <span className="admin-dashboard-label">FASTBITE MANAGEMENT</span>
        <h1>Admin Dashboard</h1>
        <p>Welcome to the FASTBITE management panel.</p>
      </div>

      <section className="admin-dashboard-links">
        <Link to="/admin/products" className="admin-dashboard-card">
          <div className="admin-card-icon">🍔</div>
          <h2>Product Management</h2>
          <p>Add, edit, and manage restaurant products.</p>
          <span className="admin-card-action">Manage products →</span>
        </Link>

        <Link to="/admin/orders" className="admin-dashboard-card">
          <div className="admin-card-icon">📦</div>
          <h2>Orders</h2>
          <p>View and manage all restaurant orders.</p>
          <span className="admin-card-action">Manage orders →</span>
        </Link>

        <Link to="/admin/tables" className="admin-dashboard-card">
          <div className="admin-card-icon">🪑</div>
          <h2>Tables & QR Codes</h2>
          <p>Manage restaurant tables and generate QR codes.</p>
          <span className="admin-card-action">Manage tables →</span>
        </Link>

        <Link to="/admin/staff" className="admin-dashboard-card">
          <div className="admin-card-icon">👥</div>
          <h2>Staff Management</h2>
          <p>View, edit, and manage restaurant employees.</p>
          <span className="admin-card-action">View staff →</span>
        </Link>

        <Link to="/admin/staff/new" className="admin-dashboard-card">
          <div className="admin-card-icon">➕</div>
          <h2>Add Staff Member</h2>
          <p>Create an account for a new restaurant employee.</p>
          <span className="admin-card-action">Add member →</span>
        </Link>
      </section>
    </main>
  );
}
