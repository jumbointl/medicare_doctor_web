import { useAuth } from "../../hooks/useAuth";

function InfoRow({ label, value }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "180px 1fr",
        gap: 12,
        padding: "12px 0",
        borderBottom: "1px solid #e2e8f0",
      }}
    >
      <div style={{ color: "#64748b", fontWeight: 600 }}>{label}</div>
      <div style={{ color: "#0f172a" }}>{value || "-"}</div>
    </div>
  );
}

export default function DoctorProfilePage() {
  const { user, doctor } = useAuth();

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Profile</h1>
        <p style={{ marginTop: 8, color: "#64748b" }}>
          Review your doctor account and basic configuration.
        </p>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 20,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          marginBottom: 16,
        }}
      >
        <h3 style={{ marginTop: 0 }}>User Account</h3>
        <InfoRow label="User ID" value={user?.id} />
        <InfoRow label="Name" value={user?.name || user?.f_name} />
        <InfoRow label="Email" value={user?.email} />
        <InfoRow label="Phone" value={user?.phone} />
        <InfoRow label="Auth Provider" value={user?.auth_provider || user?.authProvider} />
        <InfoRow label="Google Linked" value={user?.google_id ? "Yes" : "No"} />
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 20,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Doctor Profile</h3>
        <InfoRow label="Doctor ID" value={doctor?.id} />
        <InfoRow label="Clinic ID" value={doctor?.clinic_id || doctor?.clinicId} />
        <InfoRow label="Department" value={doctor?.department} />
        <InfoRow label="Specialization" value={doctor?.specialization} />
        <InfoRow label="Experience Years" value={doctor?.ex_year || doctor?.exYear} />
        <InfoRow label="Active" value={Number(doctor?.active) === 1 ? "Yes" : "No"} />
        <InfoRow
          label="Video Appointments"
          value={Number(doctor?.video_appointment || doctor?.videoAppointment) === 1 ? "Enabled" : "Disabled"}
        />
        <InfoRow
          label="Video Provider"
          value={doctor?.video_provider || doctor?.videoProvider || "agora"}
        />
        <InfoRow
          label="Clinic Appointments"
          value={Number(doctor?.clinic_appointment || doctor?.clinicAppointment) === 1 ? "Enabled" : "Disabled"}
        />
        <InfoRow
          label="Emergency Appointments"
          value={Number(doctor?.emergency_appointment || doctor?.emergencyAppointment) === 1 ? "Enabled" : "Disabled"}
        />
      </div>
    </div>
  );
}