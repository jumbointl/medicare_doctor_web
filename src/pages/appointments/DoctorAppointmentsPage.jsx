import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDoctorAppointments } from "../../api/appointmentsApi";

function StatusBadge({ value }) {
  const status = String(value || "").toLowerCase();

  const styleMap = {
    pending: { background: "#fff3cd", color: "#856404" },
    confirmed: { background: "#d1ecf1", color: "#0c5460" },
    completed: { background: "#d4edda", color: "#155724" },
    visited: { background: "#d4edda", color: "#155724" },
    cancelled: { background: "#f8d7da", color: "#721c24" },
    rejected: { background: "#f8d7da", color: "#721c24" },
    rescheduled: { background: "#e2e3e5", color: "#383d41" },
  };

  const style = styleMap[status] || { background: "#eef2f7", color: "#334155" };

  return (
    <span
      style={{
        ...style,
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {value || "-"}
    </span>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600 }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          border: "1px solid #cbd5e1",
          borderRadius: 10,
          padding: "10px 12px",
          background: "#fff",
        }}
      >
        {options.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function FilterDate({ label, value, onChange }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600 }}>{label}</label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          border: "1px solid #cbd5e1",
          borderRadius: 10,
          padding: "10px 12px",
          background: "#fff",
        }}
      />
    </div>
  );
}

export default function DoctorAppointmentsPage() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const res = await getDoctorAppointments({
        status: status || undefined,
        type: type || undefined,
        date: date || undefined,
        page,
      });

      const payload = res?.data ?? {};
      setRows(payload?.data ?? []);
      setMeta(payload);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not load appointments.");
      setRows([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [status, type, date, page]);

  function resetFilters() {
    setStatus("");
    setType("");
    setDate("");
    setPage(1);
  }

  return (
    <div style={{ padding: 24, maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Appointments</h1>
        <p style={{ marginTop: 8, color: "#64748b" }}>
          View and manage only your own appointments.
        </p>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
            alignItems: "end",
          }}
        >
          <FilterSelect
            label="Status"
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            options={[
              { label: "All", value: "" },
              { label: "Pending", value: "Pending" },
              { label: "Confirmed", value: "Confirmed" },
              { label: "Completed", value: "Completed" },
              { label: "Visited", value: "Visited" },
              { label: "Cancelled", value: "Cancelled" },
              { label: "Rejected", value: "Rejected" },
              { label: "Rescheduled", value: "Rescheduled" },
            ]}
          />

          <FilterSelect
            label="Type"
            value={type}
            onChange={(value) => {
              setType(value);
              setPage(1);
            }}
            options={[
              { label: "All", value: "" },
              { label: "OPD", value: "OPD" },
              { label: "Video Consultant", value: "Video Consultant" },
              { label: "Emergency", value: "Emergency" },
            ]}
          />

          <FilterDate
            label="Date"
            value={date}
            onChange={(value) => {
              setDate(value);
              setPage(1);
            }}
          />

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={loadData}
              style={{
                border: 0,
                borderRadius: 10,
                padding: "10px 14px",
                cursor: "pointer",
                background: "#2563eb",
                color: "#fff",
                fontWeight: 600,
              }}
            >
              Refresh
            </button>

            <button
              onClick={resetFilters}
              style={{
                border: "1px solid #cbd5e1",
                borderRadius: 10,
                padding: "10px 14px",
                cursor: "pointer",
                background: "#fff",
                color: "#0f172a",
                fontWeight: 600,
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div style={{ padding: 24 }}>Loading appointments...</div>
        ) : error ? (
          <div
            style={{
              margin: 16,
              padding: 16,
              borderRadius: 12,
              background: "#fee2e2",
              color: "#991b1b",
            }}
          >
            {error}
          </div>
        ) : rows.length === 0 ? (
          <div style={{ padding: 24 }}>No appointments found.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 980,
              }}
            >
              <thead>
                <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Time</th>
                  <th style={thStyle}>Patient</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Payment</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Video</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => {
                  const appointmentId = item?.id;
                  const itemType = item?.type ?? "-";
                  const itemStatus = item?.status ?? "-";
                  const itemPayment = item?.payment_status ?? item?.paymentStatus ?? "-";
                  const patientName =
                    item?.patient_name ||
                    item?.patientName ||
                    [item?.patient_f_name, item?.patient_l_name].filter(Boolean).join(" ") ||
                    "-";

                  const videoProvider =
                    item?.video_provider ?? item?.videoProvider ?? "-";

                  return (
                    <tr key={appointmentId} style={{ borderTop: "1px solid #e2e8f0" }}>
                      <td style={tdStyle}>#{appointmentId}</td>
                      <td style={tdStyle}>{item?.date ?? "-"}</td>
                      <td style={tdStyle}>{item?.time_slots ?? item?.timeSlots ?? "-"}</td>
                      <td style={tdStyle}>{patientName}</td>
                      <td style={tdStyle}>{itemType}</td>
                      <td style={tdStyle}>{itemPayment}</td>
                      <td style={tdStyle}>
                        <StatusBadge value={itemStatus} />
                      </td>
                      <td style={tdStyle}>
                        {itemType === "Video Consultant" ? videoProvider : "-"}
                      </td>
                      <td style={tdStyle}>
                        <button
                          onClick={() => navigate(`/appointments/${appointmentId}`)}
                          style={{
                            border: 0,
                            borderRadius: 10,
                            padding: "8px 12px",
                            cursor: "pointer",
                            background: "#2563eb",
                            color: "#fff",
                            fontWeight: 600,
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {meta && rows.length > 0 && (
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
            Showing page {meta.current_page ?? 1} of {meta.last_page ?? 1}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              disabled={!meta.prev_page_url}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              style={pageButtonStyle(!meta.prev_page_url)}
            >
              Previous
            </button>

            <button
              disabled={!meta.next_page_url}
              onClick={() =>
                setPage((prev) =>
                  meta.last_page ? Math.min(prev + 1, meta.last_page) : prev + 1
                )
              }
              style={pageButtonStyle(!meta.next_page_url)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle = {
  padding: "14px 16px",
  fontSize: 13,
  fontWeight: 700,
  color: "#334155",
};

const tdStyle = {
  padding: "14px 16px",
  fontSize: 14,
  color: "#0f172a",
  verticalAlign: "middle",
};

function pageButtonStyle(disabled) {
  return {
    border: 0,
    borderRadius: 10,
    padding: "10px 14px",
    cursor: disabled ? "not-allowed" : "pointer",
    background: disabled ? "#cbd5e1" : "#2563eb",
    color: "#fff",
    fontWeight: 600,
  };
}