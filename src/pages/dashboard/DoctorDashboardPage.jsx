import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Users,
  Video,
  Clock3,
  BadgeCheck,
  RefreshCcw,
  Building2,
  Filter,
} from "lucide-react";
import ClinicComboBox from "../../components/ClinicComboBox";
import { useAuth } from "../../contexts/AuthContext";
import {
  getDoctorDashboard,
  getDoctorCalendarStatus,
} from "../../api/dashboardApi";

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  loading = false,
  color = "#2563eb",
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: "1px solid #e2e8f0",
        background: "#fff",
        borderRadius: 18,
        padding: 20,
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        cursor: onClick ? "pointer" : "default",
        textAlign: "left",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 14,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#64748b",
            }}
          >
            {title}
          </div>

          {loading ? (
            <div
              style={{
                marginTop: 12,
                width: 80,
                height: 34,
                borderRadius: 8,
                background: "#e5e7eb",
              }}
            />
          ) : (
            <div
              style={{
                marginTop: 10,
                fontSize: 32,
                lineHeight: 1.1,
                fontWeight: 800,
                color: "#0f172a",
              }}
            >
              {value ?? 0}
            </div>
          )}

          {subtitle ? (
            <div
              style={{
                marginTop: 10,
                fontSize: 13,
                color: "#64748b",
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>

        <div
          style={{
            flexShrink: 0,
            width: 48,
            height: 48,
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `${color}15`,
            color,
          }}
        >
          {Icon ? <Icon size={22} /> : null}
        </div>
      </div>
    </button>
  );
}

function SectionCard({ title, children, action }) {
  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        background: "#fff",
        borderRadius: 16,
        padding: 20,
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 700,
            color: "#0f172a",
          }}
        >
          {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  );
}

const quickActionStyle = {
  border: "1px solid #e2e8f0",
  background: "#fff",
  borderRadius: 12,
  padding: "14px 16px",
  fontWeight: 700,
  color: "#0f172a",
  cursor: "pointer",
  textAlign: "left",
};

const inputStyle = {
  width: "100%",
  height: 42,
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  padding: "0 12px",
  fontSize: 14,
  background: "#fff",
};

export default function DoctorDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [calendarStatus, setCalendarStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [error, setError] = useState("");

  const clinicOptions = useMemo(() => {
    const rows = user?.doctor_clinics || user?.clinics || [];

    const mapped = rows
      .filter(
        (item) =>
          item && (item.is_active === undefined || Number(item.is_active) === 1)
      )
      .map((item) => ({
        id: String(item.clinic_id),
        title: item.clinic_title,
      }));

    return mapped.length > 1 ? [{ id: "all", title: "All" }, ...mapped] : mapped;
  }, [user]);

  const [selectedClinic, setSelectedClinic] = useState({
    id: "all",
    title: "All",
  });

  function getLocalDateInputValue() {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60 * 1000);
    return local.toISOString().slice(0, 10);
  }
  const today = getLocalDateInputValue();

  const [quickStatus, setQuickStatus] = useState("ALL");
  const [quickType, setQuickType] = useState("ALL");
  const [quickStartDate, setQuickStartDate] = useState(today);
  const [quickEndDate, setQuickEndDate] = useState(today);

  useEffect(() => {
    if (!clinicOptions.length) return;

    const currentId = String(selectedClinic?.id || "");
    const exists = clinicOptions.some((item) => String(item.id) === currentId);

    if (!exists) {
      setSelectedClinic(clinicOptions[0]);
    }
  }, [clinicOptions, selectedClinic]);

  const currentClinicId =
    selectedClinic?.id && selectedClinic.id !== "all" ? selectedClinic.id : "";

  async function loadCalendarStatus(clinicId = "") {
    setCalendarLoading(true);

    try {
      const res = await getDoctorCalendarStatus(clinicId);
      console.log("DOCTOR_CALENDAR_STATUS =", res);
      setCalendarStatus(res || null);
    } catch (err) {
      console.error("loadCalendarStatus error =", err);
      setCalendarStatus(null);
    } finally {
      setCalendarLoading(false);
    }
  }

  async function loadData(clinicId = "") {
    setLoading(true);
    setError("");

    try {
      const dashboardRes = await getDoctorDashboard(clinicId);

      console.log("DOCTOR_DASHBOARD_RESPONSE =", dashboardRes);

      await loadCalendarStatus(clinicId);
      setDashboard(dashboardRes || null);
    } catch (err) {
      console.error("loadData error =", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not load dashboard."
      );
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData(currentClinicId);
  }, [currentClinicId]);

  function goToAppointmentsWithQuickFilters() {
    if (quickStartDate && quickEndDate && quickStartDate > quickEndDate) {
      alert("Start date cannot be after end date");
      return;
    }

    const params = new URLSearchParams();

    if (quickStatus && quickStatus !== "ALL") {
      params.set("status", quickStatus);
    }

    if (quickType && quickType !== "ALL") {
      params.set("type", quickType);
    }

    if (quickStartDate) {
      params.set("start", quickStartDate);
    }

    if (quickEndDate) {
      params.set("end", quickEndDate);
    }

    if (currentClinicId) {
      params.set("clinic_id", currentClinicId);
    }

    navigate(`/appointments?${params.toString()}`);
  }

  const stats = dashboard?.data || dashboard?.stats || dashboard || {};

  const totalAppointments = stats?.total_appointments ?? 0;
  const todayAppointments = stats?.today_total ?? 0;
  const confirmedToday = stats?.today_confirmed ?? 0;
  const pendingAppointments = stats?.pending ?? 0;
  const videoAppointments = stats?.upcoming_video ?? 0;
  const completedAppointments = stats?.completed_today ?? 0;

  const calendarConnected =
    calendarStatus?.data?.connected ??
    calendarStatus?.connected ??
    dashboard?.calendar_connected ??
    false;

  const selectedClinicTitle =
    selectedClinic?.title ||
    clinicOptions?.find((item) => item.id === currentClinicId)?.title ||
    "All";

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 800,
              color: "#0f172a",
            }}
          >
            Dashboard
          </h1>
          <p
            style={{
              marginTop: 8,
              marginBottom: 0,
              color: "#64748b",
            }}
          >
            Overview of your appointments and consultations.
          </p>
        </div>

        <div style={{ minWidth: 260, maxWidth: 320, width: "100%" }}>
          <ClinicComboBox
            data={clinicOptions}
            name="Clinic"
            defaultData={selectedClinic}
            setState={setSelectedClinic}
          />
        </div>
      </div>

      <div
        style={{
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            borderRadius: 999,
            background: "#eff6ff",
            color: "#1d4ed8",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          <Building2 size={16} />
          Clinic: {selectedClinicTitle}
        </div>

        <button
          type="button"
          onClick={() => loadData(currentClinicId)}
          style={{
            border: "1px solid #cbd5e1",
            background: "#fff",
            color: "#0f172a",
            borderRadius: 12,
            padding: "10px 14px",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          <RefreshCcw size={16} />
          Refresh
        </button>
      </div>

      {error ? (
        <div
          style={{
            marginBottom: 16,
            padding: 14,
            borderRadius: 12,
            background: "#fef2f2",
            color: "#b91c1c",
            border: "1px solid #fecaca",
          }}
        >
          {error}
        </div>
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatCard
          title="Today Appointments"
          value={todayAppointments}
          subtitle={`Confirmed today: ${confirmedToday}`}
          loading={loading}
          icon={CalendarDays}
          color="#2563eb"
          onClick={() =>
            navigate(`/appointments?start=${today}&end=${today}&status=ALL`)
          }
        />

        <StatCard
          title="Total Appointments"
          value={totalAppointments}
          subtitle="All appointments"
          loading={loading}
          icon={Users}
          color="#7c3aed"
          onClick={() => navigate("/appointments")}
        />

        <StatCard
          title="Pending"
          value={pendingAppointments}
          subtitle="Appointments waiting confirmation"
          loading={loading}
          icon={Clock3}
          color="#ea580c"
          onClick={() =>
            navigate(`/appointments?start=${today}&end=${today}&status=Pending`)
          }
        />

        <StatCard
          title="Video Consultations"
          value={videoAppointments}
          subtitle="Pending or confirmed video consults"
          loading={loading}
          icon={Video}
          color="#0891b2"
          onClick={() =>
            navigate(
              `/appointments?type=Video%20Consultant&start=${today}&end=${today}&status=ALL`
            )
          }
        />

        <StatCard
          title="Completed Today"
          value={completedAppointments}
          subtitle={`Confirmed today: ${confirmedToday}`}
          loading={loading}
          icon={BadgeCheck}
          color="#16a34a"
          onClick={() =>
            navigate(`/appointments?start=${today}&end=${today}&status=Completed`)
          }
        />
      </div>

      <SectionCard
        title="Quick Appointment Filter"
        action={
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: "#64748b",
              fontSize: 14,
            }}
          >
            <Filter size={16} />
            Fast navigation
          </div>
        }
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
            alignItems: "end",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: 6,
                fontWeight: 600,
                color: "#334155",
                fontSize: 14,
              }}
            >
              Type
            </label>
            <select
              value={quickType}
              onChange={(e) => setQuickType(e.target.value)}
              style={inputStyle}
            >
              <option value="ALL">ALL</option>
              <option value="ODC">ODC</option>
              <option value="Video Consultant">Video Consultant</option>
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: 6,
                fontWeight: 600,
                color: "#334155",
                fontSize: 14,
              }}
            >
              Status
            </label>
            <select
              value={quickStatus}
              onChange={(e) => setQuickStatus(e.target.value)}
              style={inputStyle}
            >
              <option value="ALL">ALL</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Visited">Visited</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: 6,
                fontWeight: 600,
                color: "#334155",
                fontSize: 14,
              }}
            >
              Start Date
            </label>
            <input
              type="date"
              value={quickStartDate}
              onChange={(e) => setQuickStartDate(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: 6,
                fontWeight: 600,
                color: "#334155",
                fontSize: 14,
              }}
            >
              End Date
            </label>
            <input
              type="date"
              value={quickEndDate}
              onChange={(e) => setQuickEndDate(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <button
              type="button"
              onClick={goToAppointmentsWithQuickFilters}
              style={{
                width: "100%",
                height: 42,
                borderRadius: 10,
                border: "none",
                background: "#2563eb",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Go
            </button>
          </div>
        </div>
      </SectionCard>

      <div style={{ height: 24 }} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 16,
        }}
      >
        <SectionCard
          title="Calendar Status"
          action={
            calendarLoading ? (
              <span style={{ color: "#64748b", fontSize: 14 }}>Loading...</span>
            ) : null
          }
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: 16,
              borderRadius: 14,
              background: calendarConnected ? "#ecfdf5" : "#fff7ed",
              border: `1px solid ${calendarConnected ? "#bbf7d0" : "#fed7aa"}`,
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 700,
                  color: "#0f172a",
                  marginBottom: 6,
                }}
              >
                {calendarConnected
                  ? "Calendar Connected"
                  : "Calendar Not Connected"}
              </div>
              <div style={{ color: "#64748b", fontSize: 14 }}>
                {calendarConnected
                  ? "Your Google Calendar integration is active."
                  : "Connect your calendar to sync appointments."}
              </div>
            </div>

            <div
              style={{
                padding: "8px 12px",
                borderRadius: 999,
                background: calendarConnected ? "#16a34a" : "#ea580c",
                color: "#fff",
                fontWeight: 700,
                fontSize: 12,
                whiteSpace: "nowrap",
              }}
            >
              {calendarConnected ? "Connected" : "Pending"}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Quick Actions">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 12,
            }}
          >
            <button
              type="button"
              onClick={() => navigate("/appointments")}
              style={quickActionStyle}
            >
              View Appointments
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(`/appointments?start=${today}&end=${today}&status=Pending`)
              }
              style={quickActionStyle}
            >
              Pending Appointments
            </button>

            <button
              type="button"
              onClick={() => navigate("/profile")}
              style={quickActionStyle}
            >
              My Profile
            </button>

            <button
              type="button"
              onClick={() => loadData(currentClinicId)}
              style={quickActionStyle}
            >
              Reload Dashboard
            </button>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}