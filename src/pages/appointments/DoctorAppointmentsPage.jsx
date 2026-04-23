
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  RefreshCcw,
  Search,
  CalendarDays,
  Filter,
  Building2,
  ArrowLeft,
} from "lucide-react";

import ClinicComboBox from "../../components/ClinicComboBox";
import { useAuth } from "../../contexts/AuthContext";
import { getDoctorAppointments } from "../../api/appointmentsApi";

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

function FilterLabel({ children }) {
  return (
    <label
      style={{
        display: "block",
        marginBottom: 6,
        fontWeight: 600,
        color: "#334155",
        fontSize: 14,
      }}
    >
      {children}
    </label>
  );
}

function inputStyle() {
  return {
    width: "100%",
    height: 42,
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    padding: "0 12px",
    fontSize: 14,
    outline: "none",
    background: "#fff",
  };
}

function badgeStyle(bg, color) {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    background: bg,
    color,
    whiteSpace: "nowrap",
  };
}

function statusBadge(status) {
  switch (String(status || "").toLowerCase()) {
    case "pending":
      return badgeStyle("#fff7ed", "#c2410c");
    case "confirmed":
      return badgeStyle("#eff6ff", "#1d4ed8");
    case "completed":
      return badgeStyle("#ecfdf5", "#15803d");
    case "visited":
      return badgeStyle("#ecfeff", "#0f766e");
    case "cancelled":
      return badgeStyle("#fef2f2", "#b91c1c");
    default:
      return badgeStyle("#f8fafc", "#475569");
  }
}

export default function DoctorAppointmentsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  
  function getLocalDateInputValue() {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60 * 1000);
    return local.toISOString().slice(0, 10);
  }
  const today = getLocalDateInputValue();

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

  const initialClinicId = searchParams.get("clinic_id") || "all";
  const initialClinic =
    clinicOptions.find((item) => String(item.id) === String(initialClinicId)) ||
    { id: "all", title: "All" };

  const [selectedClinic, setSelectedClinic] = useState(initialClinic);

  const [status, setStatus] = useState(searchParams.get("status") || "ALL");
  const [type, setType] = useState(searchParams.get("type") || "ALL");
  const [startDate, setStartDate] = useState(searchParams.get("start") || today);
  const [endDate, setEndDate] = useState(searchParams.get("end") || today);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [page, setPage] = useState(Number(searchParams.get("page") || 1));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  function handleGoBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

   window.location.href = "/dashboard";
  }

  useEffect(() => {
    if (!clinicOptions.length) return;

    const clinicIdFromUrl = searchParams.get("clinic_id") || "all";
    const found =
      clinicOptions.find(
        (item) => String(item.id) === String(clinicIdFromUrl)
      ) || clinicOptions[0];

    if (found) {
      setSelectedClinic(found);
    }
  }, [clinicOptions, searchParams]);
  

  async function loadAppointments({
    pageValue = page,
    searchValue = search,
    statusValue = status,
    typeValue = type,
    startValue = startDate,
    endValue = endDate,
    clinicValue = selectedClinic?.id || "all",
  } = {}) {
    setLoading(true);
    setError("");

    try {
      const res = await getDoctorAppointments({
        page: pageValue,
        per_page: 10,
        search: searchValue,
        status: statusValue,
        type: typeValue,
        start: startValue,
        end: endValue,
        clinic_id: clinicValue,
      });

      const paginated = res?.data || {};
      setRows(paginated?.data || []);
      setPagination(paginated);
    } catch (err) {
      console.error("loadAppointments error =", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not load appointments."
      );
      setRows([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const params = {};

    if (status && status !== "ALL") params.status = status;
    if (type && type !== "ALL") params.type = type;
    if (startDate) params.start = startDate;
    if (endDate) params.end = endDate;
    if (search) params.search = search;
    if (page && page !== 1) params.page = String(page);

    const clinicId = selectedClinic?.id || "all";
    if (clinicId && clinicId !== "all") {
      params.clinic_id = clinicId;
    }

    setSearchParams(params, { replace: true });
    loadAppointments({
      pageValue: page,
      searchValue: search,
      statusValue: status,
      typeValue: type,
      startValue: startDate,
      endValue: endDate,
      clinicValue: clinicId,
    });
  }, [status, type, startDate, endDate, search, page, selectedClinic]);

  const selectedClinicTitle = selectedClinic?.title || "All";

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
            Appointments
          </h1>
          <p
            style={{
              marginTop: 8,
              marginBottom: 0,
              color: "#64748b",
            }}
          >
            Search and filter doctor appointments.
          </p>
        </div>

       <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={handleGoBack}
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
          <ArrowLeft size={16} />
          Back
        </button>

        <button
          type="button"
          onClick={() => loadAppointments()}
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
      </div>

      <SectionCard
        title="Filters"
        action={
          <div
            style={{
              display: "flex",
              alignItems: "end",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ minWidth: 280, width: 320 }}>
              <FilterLabel>Clinic</FilterLabel>
              <ClinicComboBox
                data={clinicOptions}
                name="Clinic"
                defaultData={selectedClinic}
                setState={(value) => {
                  setPage(1);
                  setSelectedClinic(value);
                }}
              />
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                color: "#64748b",
                marginBottom: 10,
              }}
            >
              <Filter size={16} />
              Active filters
            </div>
          </div>
        }
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "0.85fr 0.85fr 1fr 1fr 1.2fr",
            gap: 12,
            alignItems: "end",
          }}
        >
          <div>
            <FilterLabel>Status</FilterLabel>
            <select
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
              style={inputStyle()}
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
            <FilterLabel>Type</FilterLabel>
            <select
              value={type}
              onChange={(e) => {
                setPage(1);
                setType(e.target.value);
              }}
              style={inputStyle()}
            >
              <option value="ALL">ALL</option>
              <option value="ODC">ODC</option>
              <option value="Video Consultant">Video Consultant</option>
            </select>
          </div>

          <div>
            <FilterLabel>Start Date</FilterLabel>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setPage(1);
                setStartDate(e.target.value);
              }}
              style={inputStyle()}
            />
          </div>

          <div>
            <FilterLabel>End Date</FilterLabel>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setPage(1);
                setEndDate(e.target.value);
              }}
              style={inputStyle()}
            />
          </div>

          <div>
            <FilterLabel>Search</FilterLabel>
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#64748b",
                }}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                placeholder="Patient, status, type..."
                style={{
                  ...inputStyle(),
                  paddingLeft: 36,
                }}
              />
            </div>
          </div>
        </div>
      </SectionCard>

      {error ? (
        <div
          style={{
            marginTop: 16,
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

      <div style={{ height: 16 }} />

      <SectionCard
        title="Appointment List"
        action={
          <div style={{ color: "#64748b", fontSize: 14 }}>
            {loading
              ? "Loading..."
              : `${pagination?.total ?? rows.length ?? 0} result(s)`}
          </div>
        }
      >
        {loading ? (
          <div style={{ color: "#64748b" }}>Loading appointments...</div>
        ) : rows.length === 0 ? (
          <div
            style={{
              padding: 20,
              borderRadius: 12,
              background: "#f8fafc",
              color: "#64748b",
            }}
          >
            No appointments found.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ textAlign: "left", padding: "12px 8px", color: "#475569" }}>ID</th>
                  <th style={{ textAlign: "left", padding: "12px 8px", color: "#475569" }}>Patient</th>
                  <th style={{ textAlign: "left", padding: "12px 8px", color: "#475569" }}>Clinic</th>
                  <th style={{ textAlign: "left", padding: "12px 8px", color: "#475569" }}>Type</th>
                  <th style={{ textAlign: "left", padding: "12px 8px", color: "#475569" }}>Status</th>
                  <th style={{ textAlign: "left", padding: "12px 8px", color: "#475569" }}>Date</th>
                  <th style={{ textAlign: "left", padding: "12px 8px", color: "#475569" }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                      cursor: "pointer",
                    }}
                    onClick={() => navigate(`/appointments/${item.id}`)}
                  >
                    <td style={{ padding: "14px 8px", color: "#0f172a", fontWeight: 600 }}>
                      #{item.id}
                    </td>
                    <td style={{ padding: "14px 8px", color: "#0f172a" }}>
                      {item.patient_name || "-"}
                    </td>
                    <td style={{ padding: "14px 8px", color: "#334155" }}>
                      {item.clinic_name || "-"}
                    </td>
                    <td style={{ padding: "14px 8px", color: "#334155" }}>
                      {item.type || "-"}
                    </td>
                    <td style={{ padding: "14px 8px" }}>
                      <span style={statusBadge(item.status)}>
                        {item.status || "-"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 8px", color: "#334155" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <CalendarDays size={14} />
                        {item.date || "-"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 8px", color: "#334155" }}>
                      {item.time_slots || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.last_page > 1 ? (
          <div
            style={{
              marginTop: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ color: "#64748b", fontSize: 14 }}>
              Page {pagination.current_page} of {pagination.last_page}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                disabled={pagination.current_page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                style={{
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                  borderRadius: 10,
                  padding: "8px 12px",
                  cursor: pagination.current_page <= 1 ? "not-allowed" : "pointer",
                  opacity: pagination.current_page <= 1 ? 0.5 : 1,
                }}
              >
                Previous
              </button>

              <button
                type="button"
                disabled={pagination.current_page >= pagination.last_page}
                onClick={() =>
                  setPage((prev) =>
                    Math.min(pagination.last_page, prev + 1)
                  )
                }
                style={{
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                  borderRadius: 10,
                  padding: "8px 12px",
                  cursor:
                    pagination.current_page >= pagination.last_page
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    pagination.current_page >= pagination.last_page ? 0.5 : 1,
                }}
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </SectionCard>
    </div>
  );
}