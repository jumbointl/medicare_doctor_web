import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getDoctorDashboard } from "../../api/dashboardApi";
import {
  getDoctorGoogleCalendarConnectUrl,
  getDoctorGoogleCalendarStatus,
  disconnectDoctorGoogleCalendar,
} from "../../api/googleCalendarApi";

function StatCard({ title, value, subtitle }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: 18,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ fontSize: 13, color: "#64748b", marginBottom: 10 }}>
        {title}
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, color: "#0f172a" }}>
        {value}
      </div>
      {subtitle ? (
        <div style={{ marginTop: 8, fontSize: 13, color: "#64748b" }}>
          {subtitle}
        </div>
      ) : null}
    </div>
  );
}

function QuickLinkCard({ title, description, to }) {
  return (
    <Link
      to={to}
      style={{
        textDecoration: "none",
        color: "inherit",
        display: "block",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 18,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          height: "100%",
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
          {title}
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 14,
            color: "#64748b",
            lineHeight: 1.5,
          }}
        >
          {description}
        </div>
      </div>
    </Link>
  );
}

function InfoAlert({ type = "info", children }) {
  const stylesByType = {
    success: {
      background: "#dcfce7",
      color: "#166534",
    },
    error: {
      background: "#fee2e2",
      color: "#991b1b",
    },
    warning: {
      background: "#fef3c7",
      color: "#92400e",
    },
    info: {
      background: "#dbeafe",
      color: "#1d4ed8",
    },
  };

  const current = stylesByType[type] || stylesByType.info;

  return (
    <div
      style={{
        ...current,
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
      }}
    >
      {children}
    </div>
  );
}

export default function DoctorDashboardPage() {
  const location = useLocation();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [calendarConnected, setCalendarConnected] = useState(false);
  const [videoProvider, setVideoProvider] = useState("agora");
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [calendarActionLoading, setCalendarActionLoading] = useState(false);

  const googleCalendarStatus = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("google_calendar");
  }, [location.search]);

  async function loadCalendarStatus() {
    setCalendarLoading(true);

    try {
      const res = await getDoctorGoogleCalendarStatus();
      console.log("google-calendar status =", res);

      setCalendarConnected(!!res?.data?.google_calendar_connected);
      setVideoProvider(
        String(res?.data?.video_provider || "agora").toLowerCase()
      );
    } catch (err) {
      console.error("loadCalendarStatus error =", err);
      setCalendarConnected(false);
      setVideoProvider("agora");
    } finally {
      setCalendarLoading(false);
    }
  }

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const dashboardRes = await getDoctorDashboard();
      await loadCalendarStatus();

      setDashboard(dashboardRes?.data ?? null);
    } catch (err) {
      console.error("loadData error =", err);
      setError(err?.response?.data?.message || "Could not load dashboard.");
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleConnectGoogleCalendar() {
    setCalendarActionLoading(true);

    try {
      const res = await getDoctorGoogleCalendarConnectUrl();
      console.log("connect-url response =", res);

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
      const res = await disconnectDoctorGoogleCalendar();
      console.log("disconnect google-calendar response =", res);

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

  useEffect(() => {
    loadData();
  }, []);

  const stats = dashboard?.data || {};

  return (
    <div style={{ padding: 24, maxWidth: 1280, margin: "0 auto" }}>
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 28 }}>Dashboard</h1>
          <p style={{ marginTop: 8, color: "#64748b" }}>
            Overview of your appointments and video consultations.
          </p>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 18,
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            minWidth: 320,
            maxWidth: 420,
            width: "100%",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
            Video Provider
          </div>

          <div style={{ marginTop: 10, fontSize: 14, color: "#64748b" }}>
            Current provider:{" "}
            <strong style={{ color: "#0f172a" }}>{videoProvider}</strong>
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 14,
              color: calendarConnected ? "#166534" : "#92400e",
            }}
          >
            {calendarLoading
              ? "Checking Google Calendar status..."
              : calendarConnected
              ? "Google Calendar connected"
              : "Google Calendar not connected"}
          </div>

          <div
            style={{
              marginTop: 14,
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            {!calendarConnected ? (
              <button
                onClick={handleConnectGoogleCalendar}
                disabled={calendarActionLoading || calendarLoading}
                style={{
                  border: 0,
                  borderRadius: 10,
                  padding: "10px 14px",
                  background:
                    calendarActionLoading || calendarLoading
                      ? "#93c5fd"
                      : "#2563eb",
                  color: "#fff",
                  cursor:
                    calendarActionLoading || calendarLoading
                      ? "not-allowed"
                      : "pointer",
                  fontWeight: 600,
                }}
              >
                {calendarActionLoading
                  ? "Connecting..."
                  : "Connect Google Calendar"}
              </button>
            ) : (
              <button
                onClick={handleDisconnectGoogleCalendar}
                disabled={calendarActionLoading || calendarLoading}
                style={{
                  border: 0,
                  borderRadius: 10,
                  padding: "10px 14px",
                  background:
                    calendarActionLoading || calendarLoading
                      ? "#fca5a5"
                      : "#ef4444",
                  color: "#fff",
                  cursor:
                    calendarActionLoading || calendarLoading
                      ? "not-allowed"
                      : "pointer",
                  fontWeight: 600,
                }}
              >
                {calendarActionLoading
                  ? "Disconnecting..."
                  : "Disconnect Google Calendar"}
              </button>
            )}
          </div>

          <div
            style={{
              marginTop: 12,
              fontSize: 12,
              color: "#64748b",
              lineHeight: 1.5,
            }}
          >
            When Google Calendar is connected, the doctor video provider will be
            set to <strong>google</strong>. Otherwise, the system uses{" "}
            <strong>agora</strong>.
          </div>
        </div>
      </div>

      {googleCalendarStatus === "connected" ? (
        <InfoAlert type="success">
          Google Calendar connected successfully. Your video provider is now set
          to Google.
        </InfoAlert>
      ) : null}

      {googleCalendarStatus === "error" ? (
        <InfoAlert type="error">
          Google Calendar could not be connected. Please try again.
        </InfoAlert>
      ) : null}

      {loading ? (
        <div>Loading dashboard...</div>
      ) : error ? (
        <InfoAlert type="error">{error}</InfoAlert>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <StatCard
              title="Today Total"
              value={stats?.today_total ?? 0}
              subtitle="All appointments scheduled for today"
            />
            <StatCard
              title="Today Confirmed"
              value={stats?.today_confirmed ?? 0}
              subtitle="Confirmed appointments today"
            />
            <StatCard
              title="Pending"
              value={stats?.pending ?? 0}
              subtitle="Appointments waiting for action"
            />
            <StatCard
              title="Upcoming Video"
              value={stats?.upcoming_video ?? 0}
              subtitle="Upcoming video consultations"
            />
            <StatCard
              title="Completed Today"
              value={stats?.completed_today ?? 0}
              subtitle="Completed or visited today"
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
            }}
          >
            <QuickLinkCard
              to="/appointments"
              title="Appointments"
              description="View, filter, and manage your own appointments."
            />
            <QuickLinkCard
              to="/notifications"
              title="Notifications"
              description="Check doctor notifications and mark them as seen."
            />
            <QuickLinkCard
              to="/reviews"
              title="Reviews"
              description="Read the reviews written for your profile."
            />
            <QuickLinkCard
              to="/profile"
              title="Profile"
              description="Review your doctor profile and provider settings."
            />
          </div>
        </>
      )}
    </div>
  );
}