import { useEffect, useState } from "react";
import axios from "axios";
import api from "../api/axios";
import "./StaffProfile.css";

interface StaffProfileData {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
}

function StaffProfile() {
  const [profile, setProfile] = useState<StaffProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get<{ user: StaffProfileData }>("/users/me");

        if (!cancelled) {
          setProfile(response.data.user);
        }
      } catch (err: unknown) {
        if (cancelled) return;

        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            setError("Your session has expired. Please log in again.");
          } else {
            setError(
              err.response?.data?.error ??
                "Failed to load your profile. Please try again.",
            );
          }
        } else {
          setError("An unexpected error occurred.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <main className="staff-profile-page">
        <p className="profile-message">Loading your profile...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="staff-profile-page">
        <section className="profile-message profile-error" role="alert">
          {error}
        </section>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="staff-profile-page">
        <p className="profile-message">Profile information is unavailable.</p>
      </main>
    );
  }

  const joinedDate = new Date(profile.created_at);

  return (
    <main className="staff-profile-page">
      <section className="staff-profile-card">
        <div className="profile-header">
          <div className="profile-avatar" aria-hidden="true">
            {profile.name.trim().charAt(0).toUpperCase() || "S"}
          </div>

          <div className="profile-heading">
            <p className="profile-eyebrow">FASTBITE · TEAM</p>
            <h1>{profile.name}</h1>
            <span className="profile-role">
              {profile.role === "restaurant_staff"
                ? "Restaurant Staff"
                : profile.role}
            </span>
          </div>
        </div>

        <div className="profile-divider" />

        <h2>Personal Information</h2>

        <div className="profile-details">
          <div className="profile-field">
            <span>Full name</span>
            <strong>{profile.name}</strong>
          </div>

          <div className="profile-field">
            <span>Email address</span>
            <strong>{profile.email || "Not provided"}</strong>
          </div>

          <div className="profile-field">
            <span>Phone number</span>
            <strong>{profile.phone || "Not provided"}</strong>
          </div>

          <div className="profile-field">
            <span>Account created</span>
            <strong>
              {Number.isNaN(joinedDate.getTime())
                ? "Unavailable"
                : new Intl.DateTimeFormat("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }).format(joinedDate)}
            </strong>
          </div>
        </div>
      </section>
    </main>
  );
}

export default StaffProfile;
