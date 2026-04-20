import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function DoctorAppointmentVideoPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const joinData = location.state?.joinData || null;
  const provider = String(joinData?.provider || "").toLowerCase();

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 28 }}>Appointment Video</h1>
          <p style={{ marginTop: 8, color: "#64748b" }}>
            Appointment ID: {id}
          </p>
        </div>

        <button
          onClick={() => navigate(`/appointments/${id}`)}
          style={{
            border: 0,
            borderRadius: 10,
            padding: "10px 14px",
            background: "#e2e8f0",
            color: "#0f172a",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Back to appointment
        </button>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 18,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
          Provider
        </div>
        <div style={{ marginTop: 8, fontSize: 14, color: "#64748b" }}>
          {provider || "unknown"}
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 18,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
          Join data
        </div>

        {!joinData ? (
          <div style={{ marginTop: 10, color: "#991b1b" }}>
            No joinData received. Please go back and start the video again.
          </div>
        ) : (
          <pre
            style={{
              marginTop: 12,
              background: "#f8fafc",
              padding: 16,
              borderRadius: 12,
              overflow: "auto",
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            {JSON.stringify(joinData, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}