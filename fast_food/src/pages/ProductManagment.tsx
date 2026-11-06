import { useCallback, useEffect, useState, type FormEvent } from "react";
import api from "../api/axios";
import axios from "axios";
import "./ProductManagment.css";

interface Product {
  id: number;
  category_id: number;
  name: string;
  price: number;
  image_url: string | null;
  is_available: boolean;
  category_name: string;
}

interface Category {
  id: number;
  name: string;
}

interface ProductForm {
  name: string;
  category_id: string;
  price: string;
  is_available: boolean;
}

type FilterStatus = "all" | "available" | "unavailable";

const emptyForm: ProductForm = {
  name: "",
  category_id: "",
  price: "",
  is_available: true,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getRows(data: unknown, key: string): Record<string, unknown>[] {
  let rows: unknown = data;

  if (isRecord(data) && key in data) {
    rows = data[key];
  }

  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.filter(isRecord);
}

function getErrorMessage(error: unknown): string {
  if (
    isRecord(error) &&
    isRecord(error.response) &&
    isRecord(error.response.data) &&
    typeof error.response.data.error === "string"
  ) {
    return error.response.data.error;
  }

  return "Something went wrong. Please try again.";
}

export default function ProductManagement() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);

  const [form, setForm] = useState<ProductForm>(emptyForm);
  const baseURL = api.defaults.baseURL ?? "";
  const imageBaseURL = baseURL.endsWith("api")
    ? baseURL.slice(0, -4)
    : baseURL;

  const loadData = useCallback(async () => {
    try {
      setError("");

      const [productsResponse, categoriesResponse] = await Promise.all([
        api.get<unknown>("/products"),
        api.get<unknown>("/categories"),
      ]);

      const categoryRows = getRows(categoriesResponse.data, "categories");

      const loadedCategories: Category[] = categoryRows
        .filter(
          (row) => typeof row.id === "number" && typeof row.name === "string",
        )
        .map((row) => ({
          id: row.id as number,
          name: row.name as string,
        }));

      const categoryNames = new Map(
        loadedCategories.map((category) => [category.id, category.name]),
      );

      const productRows = getRows(productsResponse.data, "products");

      const loadedProducts: Product[] = productRows
        .filter((row) => typeof row.id === "number")
        .map((row) => {
          const categoryId =
            typeof row.category_id === "number" ? row.category_id : 0;

          return {
            id: row.id as number,
            category_id: categoryId,
            name: typeof row.name === "string" ? row.name : "Unnamed product",
            price: Number(row.price) || 0,
            image_url: typeof row.image_url === "string" ? row.image_url : null,
            is_available: row.is_available === true,
            category_name:
              typeof row.category_name === "string"
                ? row.category_name
                : (categoryNames.get(categoryId) ?? "Uncategorized"),
          };
        });

      setCategories(loadedCategories);
      setProducts(loadedProducts);

      return true;
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(() => {
      if (!cancelled) {
        void loadData();
      }
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [loadData]);

  function openAddForm() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      category_id: categories[0]?.id.toString() ?? "",
    });
    setShowForm(true);
    setError("");
    setMessage("");
    setSelectedImage(null);
    setImagePreview(null);
  }

  function openEditForm(product: Product) {
    setEditingId(product.id);

    setSelectedImage(null);
    setImagePreview(
      product.image_url
        ? `${imageBaseURL}${product.image_url}`
        : null,
    );
    setForm({
      name: product.name,
      category_id: product.category_id.toString(),
      price: product.price.toString(),
      is_available: product.is_available,
    });

    setShowForm(true);
    setError("");
    setMessage("");
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setSelectedImage(null);
    setImagePreview(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const categoryId = Number(form.category_id);
    const price = Number(form.price);

    if (
      !form.name.trim() ||
      !Number.isInteger(categoryId) ||
      categoryId <= 0 ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      setError("Please enter valid product information.");
      return;
    }

    const productData = {
      name: form.name.trim(),
      category_id: categoryId,
      price,
      is_available: form.is_available,
    };

    try {
      setSaving(true);
      setError("");
      setMessage("");

      let productId: number;

      if (editingId !== null) {
        productId = editingId;
        await api.patch(`/products/${editingId}`, productData);
      } else {
        const response = await api.post("/products", productData);
        productId = response.data.product.id;
      }

      // Upload image if one was selected
      if (selectedImage) {
        const imageData = new FormData();
        imageData.append("image", selectedImage);

        await api.post(`/products/${productId}/image`, imageData);
      }

      closeForm();

      const refreshed = await loadData();

      if (refreshed) {
        setMessage(
          editingId !== null
            ? "Product updated successfully."
            : "Product added successfully.",
        );
      }
    } catch (err: unknown) {
      if(axios.isAxiosError(err)) {
        console.log("status:", err.response?.status);
        console.log("server response:", err.response?.data);
        console.log("Request URL:", err.config?.url);
        console.log("Request headers:", err.config?.headers);
      }
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailability(product: Product) {
    const nextStatus = !product.is_available;

    try {
      setSavingId(product.id);
      setError("");
      setMessage("");

      await api.patch(`/products/${product.id}`, {
        is_available: nextStatus,
      });

      const refreshed = await loadData();

      if (refreshed) {
        setMessage(
          nextStatus
            ? "Product activated successfully."
            : "Product deactivated successfully.",
        );
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.trim().toLowerCase());

    const matchesCategory =
      categoryFilter === "all" ||
      product.category_id.toString() === categoryFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "available" && product.is_available) ||
      (statusFilter === "unavailable" && !product.is_available);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const availableCount = products.filter(
    (product) => product.is_available,
  ).length;

  const unavailableCount = products.length - availableCount;

  if (loading) {
    return (
      <main className="product-management-page">
        <p>Loading products...</p>
      </main>
    );
  }

  return (
    <main className="product-management-page">
      <header className="product-page-header">
        <div>
          <span className="product-eyebrow">FASTBITE ADMIN</span>
          <h1>Product Management</h1>
          <p>Manage your restaurant menu and product availability.</p>
        </div>

        <button
          className="product-add-button"
          type="button"
          onClick={openAddForm}
        >
          + Add Product
        </button>
      </header>

      <section className="product-stats">
        <article className="product-stat-card">
          <span>Total Products</span>
          <strong>{products.length}</strong>
        </article>

        <article className="product-stat-card">
          <span>Available</span>
          <strong className="product-stat-available">{availableCount}</strong>
        </article>

        <article className="product-stat-card">
          <span>Unavailable</span>
          <strong className="product-stat-unavailable">
            {unavailableCount}
          </strong>
        </article>
      </section>

      {error && (
        <div className="product-alert error" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className="product-alert success" role="status">
          {message}
        </div>
      )}

      {showForm && (
        <section className="product-form-panel">
          <h2>{editingId !== null ? "Edit Product" : "Add New Product"}</h2>

          <form onSubmit={handleSubmit}>
            <label>
              Product Name
              <input
                type="text"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label>
              Category
              <select
                value={form.category_id}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    category_id: event.target.value,
                  }))
                }
                required
              >
                <option value="">Select category</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Price
              <input
                type="number"
                min="1"
                step="1"
                value={form.price}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    price: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label>
              Product Image
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;

                  setSelectedImage(file);

                  if (imagePreview?.startsWith("blob:")) {
                    URL.revokeObjectURL(imagePreview);
                  }

                  setImagePreview(file ? URL.createObjectURL(file) : null);
                }}
              />
            </label>

            {imagePreview && (
              <div className="product-image-preview">
                <img src={imagePreview} alt="Product preview" />
              </div>
            )}

            <label className="product-availability-field">
              <input
                type="checkbox"
                checked={form.is_available}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    is_available: event.target.checked,
                  }))
                }
              />
              Available for customers
            </label>

            <div className="product-form-actions">
              <button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Product"}
              </button>

              <button
                type="button"
                className="product-cancel-button"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="product-toolbar">
        <input
          type="search"
          placeholder="Search products..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as FilterStatus)
          }
        >
          <option value="all">All Statuses</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>
      </section>

      <section className="product-list-header">
        <h2>Restaurant Products</h2>
        <span>{filteredProducts.length} products</span>
      </section>

      {filteredProducts.length === 0 ? (
        <div className="product-empty">No products found.</div>
      ) : (
        <section className="product-grid">
          {filteredProducts.map((product) => (
            <article className="product-card" key={product.id}>

              {product.image_url ? (
                <img src={`${imageBaseURL}${product.image_url}`}
                alt={product.name} className="product-card-image" />
              ) : (
              <div className="product-image-placeholder">
                <span>No image</span>
              </div>
              )}
              <div className="product-card-content">
                <div className="product-card-top">
                  <span className="product-category">
                    {product.category_name}
                  </span>

                  <span
                    className={
                      product.is_available
                        ? "product-status available"
                        : "product-status unavailable"
                    }
                  >
                    {product.is_available ? "Available" : "Unavailable"}
                  </span>
                </div>

                <h3>{product.name}</h3>

                <strong className="product-price">
                  {product.price.toLocaleString("en-US")}
                </strong>

                <div className="product-card-actions">
                  <button
                    type="button"
                    onClick={() => openEditForm(product)}
                    disabled={savingId === product.id || saving}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="product-toggle-button"
                    onClick={() => void toggleAvailability(product)}
                    disabled={savingId === product.id || saving}
                  >
                    {savingId === product.id
                      ? "Please wait..."
                      : product.is_available
                        ? "Deactivate"
                        : "Activate"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
