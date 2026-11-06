import "./StaffManagment.css";
import { useEffect, useState, type FormEvent } from "react";
import api from "../api/axios";

interface StaffMember {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  role: string;
  employment_start_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function StaffManagement() {
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [editForm, setEditForm] = useState({
    phone: "",
    email: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function loadStaff() {
      try {
        setError("");

        const response = await api.get<{ staff: StaffMember[] }>(
          "/admin/staff",
        );

        if (!cancelled) {
          setStaff(response.data.staff);
        }
      } catch {
        if (!cancelled) {
          setError("Could not load staff members.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadStaff();

    return () => {
      cancelled = true;
    };
  }, []);

  function startEditing(member: StaffMember) {
    setEditingId(member.id);
    setEditForm({
      phone: member.phone,
      email: member.email ?? "",
    });
    setError("");
    setMessage("");
  }

  async function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingId === null) return;

    setSavingId(editingId);
    setError("");
    setMessage("");

    try {
      const response = await api.patch<{
        message: string;
        staff: StaffMember;
      }>(`/admin/staff/${editingId}`, {
        phone: editForm.phone.trim(),
        email: editForm.email.trim() || null,
      });

      setStaff((previous) =>
        previous.map((member) =>
          member.id === editingId ? response.data.staff : member,
        ),
      );

      setMessage(response.data.message);
      setEditingId(null);
    } catch (err: unknown) {
      const responseError =
        typeof err === "object" && err !== null && "response" in err
          ? err.response
          : null;

      const data =
        typeof responseError === "object" &&
        responseError !== null &&
        "data" in responseError
          ? responseError.data
          : null;

      const serverMessage =
        typeof data === "object" &&
        data !== null &&
        "error" in data &&
        typeof data.error === "string"
          ? data.error
          : null;

      setError(serverMessage || "Could not update staff information.");
    } finally {
      setSavingId(null);
    }
  }

  async function toggleStatus(member: StaffMember) {
    const nextStatus = !member.is_active;

    const confirmed = window.confirm(
      nextStatus
        ? `Activate ${member.name}'s account?`
        : `Deactivate ${member.name}'s account?`,
    );

    if (!confirmed) return;

    setSavingId(member.id);
    setError("");
    setMessage("");

    try {
      const response = await api.patch<{
        message: string;
        staff: StaffMember;
      }>(`/admin/staff/${member.id}/status`, {
        is_active: nextStatus,
      });

      setStaff((previous) =>
        previous.map((item) =>
          item.id === member.id ? response.data.staff : item,
        ),
      );

      setMessage(response.data.message);
    } catch {
      setError("Could not change the staff account status.");
    } finally {
      setSavingId(null);
    }
  }

  if (loading) {
    return <p>Loading staff members...</p>;
  }

  if (error && staff.length === 0) {
    return <p role="alert">{error}</p>;
  }

  const filteredStaff = staff.filter((member) => {
    if (statusFilter === "active") return member.is_active;
    if (statusFilter === "inactive") return !member.is_active;
    return true;
  });

  const stats = [
  { title: "Total Staff", value: staff.length },
  { title: "Active Staff", value: staff.filter(s => s.is_active).length },
  { title: "Inactive Staff", value: staff.filter(s => !s.is_active).length },
];

  return (
    <main className="staff-management-page">
      <h1>Staff Management</h1>
      <p>View and manage restaurant employees.</p>

      <section className="staff-stats">
  {stats.map((item) => (
    <article className="staff-stat-card" key={item.title}>
      <span>{item.title}</span>
      <strong>{item.value}</strong>
    </article>
  ))}
</section>

      <div className="staff-filters">
        <button
          type="button"
          onClick={() => setStatusFilter("all")}
          aria-pressed={statusFilter === "all"}
        >
          All ({staff.length})
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("active")}
          aria-pressed={statusFilter === "active"}
        >
          Active ({staff.filter((member) => member.is_active).length})
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("inactive")}
          aria-pressed={statusFilter === "inactive"}
        >
          Inactive ({staff.filter((member) => !member.is_active).length})
        </button>
      </div>

      {message && <p role="status">{message}</p>}
      {error && <p role="alert">{error}</p>}

      {filteredStaff.length === 0 ? (
        <p>No staff members match this filter.</p>
      ) : (
        <div>
          {filteredStaff.map((member) => (
            <article key={member.id} className="staff-card">
              <h2>{member.name}</h2>

              {editingId === member.id ? (
                <form onSubmit={handleEditSubmit}>
                  <div>
                    <label htmlFor={`phone-${member.id}`}>Phone Number</label>
                    <input
                      id={`phone-${member.id}`}
                      type="tel"
                      value={editForm.phone}
                      onChange={(event) =>
                        setEditForm((previous) => ({
                          ...previous,
                          phone: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor={`email-${member.id}`}>
                      Email (Optional)
                    </label>
                    <input
                      id={`email-${member.id}`}
                      type="email"
                      value={editForm.email}
                      onChange={(event) =>
                        setEditForm((previous) => ({
                          ...previous,
                          email: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <button type="submit" disabled={savingId === member.id}>
                    {savingId === member.id ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    disabled={savingId === member.id}
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <p>
                    <strong>Phone:</strong> {member.phone}
                  </p>
                  <p>
                    <strong>Email:</strong> {member.email || "Not provided"}
                  </p>
                  <p>
                    <strong>Role:</strong> {member.role}
                  </p>
                  <p>
                    <strong>Employment start date:</strong>{" "}
                    {member.employment_start_date
                      ? member.employment_start_date.slice(0, 10)
                      : "Not set"}
                  </p>

                  <p>
                    <strong>Account status:</strong>{" "}
                    <span
                      className={
                        member.is_active
                          ? "staff-status staff-status-active"
                          : "staff-status staff-status-inactive"
                      }
                    >
                      {member.is_active ? "Active" : "Inactive"}
                    </span>
                  </p>

                  <button
                    type="button"
                    disabled={savingId === member.id}
                    onClick={() => startEditing(member)}
                  >
                    Edit Information
                  </button>

                  <button
                    type="button"
                    disabled={savingId === member.id}
                    onClick={() => void toggleStatus(member)}
                  >
                    {savingId === member.id
                      ? "Please wait..."
                      : member.is_active
                        ? "Deactivate"
                        : "Activate"}
                  </button>
                </>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
