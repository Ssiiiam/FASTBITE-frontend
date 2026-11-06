import ProductManagement from "./pages/ProductManagment";
import StaffManagement from "./pages/StaffManagment";
import AddStaff from "./pages/AddStaff";
import AdminProfile from "./pages/AdminProfile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrderDetails from "./pages/AdminOrderDetails";
import AdminOrders from "./pages/AdminOrders";
import StaffProfile from "./pages/StaffProfile";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import StaffDashboard from "./pages/StaffDashboard";
import Menu from "./pages/Menu";
import AdminTables from "./pages/AdminTables";
import Checkout from "./pages/Checkout";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Profile from "./pages/Profile";
import ScrollToTop from "./components/ScrollToTop";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import RoleRoute from "./components/RoleRoute";

import Footer from "./components/Footer";
import Navbar from "./components/Navbar";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Navbar />

          <Routes>
            {/* Public pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/cart" element={<Cart />} />
            {/* Customer-only pages */}
            <Route element={<RoleRoute allowedRoles={["customer"]} />}>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetails />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Staff and admin pages */}
            <Route
              element={
                <RoleRoute allowedRoles={["restaurant_staff", "admin"]} />
              }
            >
              <Route path="/staff" element={<StaffDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>

            {/* Staff Profile */}
            <Route
              element={
                <RoleRoute allowedRoles={["restaurant_staff", "admin"]} />
              }
            >
              <Route path="/staff/profile" element={<StaffProfile />} />
            </Route>

            {/* Admin-only pages */}
            <Route element={<RoleRoute allowedRoles={["admin"]} />}>
              <Route path="/admin/products" element={<ProductManagement />} />
              <Route path="/admin/staff" element={<StaffManagement />} />
              <Route path="/admin/staff/new" element={<AddStaff />} />
              <Route path="/admin/orders/:id" element={<AdminOrderDetails />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/tables" element={<AdminTables />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
            </Route>

            {/* Unknown paths */}
          </Routes>

          <Footer />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
