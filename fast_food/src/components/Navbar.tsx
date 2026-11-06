import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();

  const cartItemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const isStaff = user?.role === "restaurant_staff";
  const isAdmin = user?.role === "admin";
  const isCustomer = !user || user.role === "customer";

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link
          to={isStaff ? "/staff" : isAdmin ? "/admin" : "/"}
          className="navbar-logo"
        >
          <span>FAST</span>BITE
        </Link>

        <div className="navbar-links">
          {isStaff && (
            <>
              <Link to="/staff" className="navbar-link">
                Orders Dashboard
              </Link>
              <Link to="/staff/profile" className="navbar-link">
                My Profile
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <Link to="/admin" className="navbar-link">
                Admin Dashboard
              </Link>
              <Link to="/admin/profile" className="navbar-link">
                My Profile
              </Link>
            </>
          )}

          {isCustomer && (
            <>
              <Link to="/" className="navbar-link">
                Home
              </Link>
              <Link to="/menu" className="navbar-link">
                Menu
              </Link>
              {user && (
                <>
                  <Link to="/orders" className="navbar-link">
                    Orders
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        <div className="navbar-actions">
          {isCustomer && (
            <Link to="/cart" className="cart-button">
              🛒 <span>Cart</span>
              {cartItemCount > 0 && (
                <span className="cart-count">{cartItemCount}</span>
              )}
            </Link>
          )}

          {user ? (
            <button className="logout-button" onClick={logout}>
              Logout
            </button>
          ) : (
            <Link to="/login" className="login-button">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
