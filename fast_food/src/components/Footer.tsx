import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <span>FAST</span>BITE
          </Link>

          <p>
            Fresh food, bold flavors, and a better way to enjoy your favorite
            meals.
          </p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>

          <Link to="/">Home</Link>
          <Link to="/menu">Menu</Link>
          <Link to="/orders">Orders</Link>
          <Link to="/profile">Profile</Link>
        </div>

        <div className="footer-section">
          <h3>Customer</h3>

          <Link to="/login">Login</Link>
          <Link to="/register">Create Account</Link>
          <Link to="/cart">Cart</Link>
        </div>

        <div className="footer-section">
          <h3>Contact</h3>

          <p>📍 Iran</p>
          <p>📞 +98 000 000 0000</p>
          <p>✉️ hello@fastbite.com</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 FASTBITE. All rights reserved.</p>

        <p>Made with ❤️ &amp; React</p>
      </div>
    </footer>
  );
}

export default Footer;
