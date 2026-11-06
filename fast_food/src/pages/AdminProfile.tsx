import { useAuth } from "../context/AuthContext";
import "./AdminProfile.css";

export default function AdminProfile() {
  const { user } = useAuth();

  if (!user) {
    return (
      <main className="admin-profile-page">
        <div className="admin-profile-message">
          Please log in to view your profile.
        </div>
      </main>
    );
  }

  return (
    <main className="admin-profile-page">
      <div className="admin-profile-container">
        <header className="admin-profile-header">
          <span className="admin-profile-label">ACCOUNT SETTINGS</span>
          <h1> Admin Profile</h1>
          <p>View your account information and administrator details.</p>
        </header>

        <section className="admin-profile-card">
          <div className="admin-profile-avatar">
            {user.name?.charAt(0).toUpperCase()}
          </div>

          <div className="admin-profile-user">
            <h2>{user.name}</h2>
            <span className="admin-profile-role">{user.role}</span>
          </div>

          <div className="admin-profile-divider" />

          <h3>Account Information</h3>

          <div className="admin-profile-info">
            <div className="admin-profile-info-item">
              <span>Name</span>
              <strong>{user.name}</strong>
            </div>

            <div className="admin-profile-info-item">
              <span>Email Address</span>
              <strong>{user.email}</strong>
            </div>

            <div className="admin-profile-info-item">
              <span>Account Role</span>
              <strong>{user.role}</strong>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}