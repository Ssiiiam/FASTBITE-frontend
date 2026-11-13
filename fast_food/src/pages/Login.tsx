import {Eye, EyeOff} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || "/";
  const { login } = useAuth();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setError("");

    try {
      setLoading(true);

      const response = await api.post("/login", {
        phone,
        password,
      });

      const { token, user } = response.data;

      login(
        {
          userId: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      );

      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "restaurant_staff") {
        navigate("/staff");
      } else {
      
        navigate(from, {replace: true});
      }
    } catch (error: unknown) {
      console.error(error);

      if (axios.isAxiosError(error) && error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError("Login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-container">
        <h1>Welcome Back</h1>

        <p>Login to continue your FASTBITE journey.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="phone">Phone</label>

            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Enter your phone number"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={()=> setShowPassword((prev)=> !prev)} >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
          <br></br>
        </form>
        <p className="register-link">
          Dont have an account? <Link to="/register">Create Account</Link>
        </p>
      </div>
    </main>
  );
}

export default Login;
