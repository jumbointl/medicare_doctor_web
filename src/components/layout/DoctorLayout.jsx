import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  getDoctorGoogleCalendarConnectUrl,
  getDoctorGoogleCalendarStatus,
  disconnectDoctorGoogleCalendar,
} from "../../api/googleCalendarApi";

function SidebarLink({ to, children }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      style={({ isActive }) => ({
        display: "block",
        padding: "12px 14px",
        borderRadius: 12,
        textDecoration: "none",
        fontWeight: 600,
        background: isActive ? "#2563eb" : "transparent",
        color: isActive ? "#fff" : "#0f172a",
      })}
    >
      {children}
    </NavLink>
  );
}

export default function DoctorLayout() {
  const navigate = useNavigate();
  const { user, doctor, logout } = useAuth();
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [videoProvider, setVideoProvider] = useState(
    String(doctor?.video_provider || doctor?.videoProvider || "agora").toLowerCase()
  );
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [calendarActionLoading, setCalendarActionLoading] = useState(false);

  async function loadCalendarStatus() {
    setCalendarLoading(true);

    try {
      const res = await getDoctorGoogleCalendarStatus();
      setCalendarConnected(!!res?.data?.google_calendar_connected);
      setVideoProvider(
        String(res?.data?.video_provider || doctor?.video_provider || doctor?.videoProvider || "agora").toLowerCase()
      );
    } catch (err) {
      console.error("loadCalendarStatus error =", err);
      setCalendarConnected(false);
      setVideoProvider(
        String(doctor?.video_provider || doctor?.videoProvider || "agora").toLowerCase()
      );
    } finally {
      setCalendarLoading(false);
    }
  }

  async function handleConnectGoogleCalendar() {
    setCalendarActionLoading(true);

    try {
      const res = await getDoctorGoogleCalendarConnectUrl();
      const url = res?.data?.url;

      if (!url) {
        throw new Error("Google connect URL not found.");
      }

      window.location.href = url;
    } catch (err) {
      console.error("handleConnectGoogleCalendar error =", err);
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Could not start Google Calendar connection."
      );
      setCalendarActionLoading(false);
    }
  }

  async function handleDisconnectGoogleCalendar() {
    const confirmed = window.confirm(
      "Disconnect Google Calendar and switch video provider back to Agora?"
    );

    if (!confirmed) {
      return;
    }

    setCalendarActionLoading(true);

    try {
      await disconnectDoctorGoogleCalendar();
      await loadCalendarStatus();
      alert("Google Calendar disconnected successfully.");
    } catch (err) {
      console.error("handleDisconnectGoogleCalendar error =", err);
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Could not disconnect Google Calendar."
      );
    } finally {
      setCalendarActionLoading(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  useEffect(() => {
    loadCalendarStatus();
  }, [doctor?.video_provider, doctor?.videoProvider]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        display: "grid",
        gridTemplateColumns: "260px 1fr",
      }}
    >
      <aside
        style={{
          borderRight: "1px solid #e2e8f0",
          background: "#fff",
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 22 }}>Doctor Portal</h2>
          <p style={{ marginTop: 8, color: "#64748b", fontSize: 14 }}>
            medicare_doctor_web
          </p>
        </div>

        <div
          style={{
            padding: 14,
            borderRadius: 16,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
            {user?.name || user?.f_name || user?.email || "Doctor"}
          </div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
            {user?.email || "-"}
          </div>
        </div>

        <div
          style={{
            padding: 14,
            borderRadius: 16,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
            Video Provider
          </div>

          <div style={{ fontSize: 13, color: "#64748b", marginTop: 10 }}>
            Current provider: <strong style={{ color: "#0f172a" }}>{videoProvider}</strong>
          </div>

          <div
            style={{
              fontSize: 12,
              marginTop: 8,
              color: calendarConnected ? "#166534" : "#92400e",
            }}
          >
            {calendarLoading
              ? "Checking Google Calendar status..."
              : calendarConnected
              ? "Google Calendar connected"
              : "Google Calendar not connected"}
          </div>

          <button
            onClick={calendarConnected ? handleDisconnectGoogleCalendar : handleConnectGoogleCalendar}
            disabled={calendarActionLoading || calendarLoading}
            style={{
              width: "100%",
              marginTop: 12,
              border: 0,
              borderRadius: 10,
              padding: "10px 12px",
              background:
                calendarActionLoading || calendarLoading
                  ? calendarConnected
                    ? "#86efac" // light green
                    : "#fdba74" // light orange
                  : calendarConnected
                  ? "#16a34a" // green
                  : "#f59e0b", // amber/orange
              color: calendarConnected ? "#fff" : "#111827",
              cursor:
                calendarActionLoading || calendarLoading ? "not-allowed" : "pointer",
              fontWeight: 700,
            }}
          >
            {calendarActionLoading
              ? calendarConnected
                ? "Disconnecting..."
                : "Connecting..."
              : calendarConnected
              ? "Disconnect Google Calendar"
              : "Connect Google Calendar"}
          </button>
        </div>
        <nav style={{ display: "grid", gap: 8 }}>
          <SidebarLink to="/">Dashboard</SidebarLink>
          <SidebarLink to="/appointments">Appointments</SidebarLink>
          <SidebarLink to="/notifications">Notifications</SidebarLink>
          <SidebarLink to="/reviews">Reviews</SidebarLink>
          <SidebarLink to="/profile">Profile</SidebarLink>
        </nav>
        <div style={{ marginTop: "auto" }}>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              border: 0,
              borderRadius: 12,
              padding: "12px 14px",
              cursor: "pointer",
              background: "#dc2626",
              color: "#fff",
              fontWeight: 700,
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      <main style={{ minWidth: 0 }}>
        <header
          style={{
            height: 72,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            borderBottom: "1px solid #e2e8f0",
            background: "#fff",
          }}
        >
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>
              Doctor Workspace
            </div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
              Manage your own appointments, files, and video consultations
            </div>
          </div>

          <div
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              background: "#eff6ff",
              color: "#1d4ed8",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            Doctor ID: {doctor?.id || "-"}
          </div>
        </header>

        <div style={{ padding: 0 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}