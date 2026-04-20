import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getDoctorAppointmentById,
  confirmDoctorAppointment,
  cancelDoctorAppointment,
  completeDoctorAppointment,
  getDoctorVideoJoinData,
} from "../../api/appointmentsApi";
import { getDoctorPatientFiles } from "../../api/patientFilesApi";

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

  const style = styleMap[status] || {
    background: "#eef2f7",
    color: "#334155",
  };

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

function SectionCard({ title, children, right }) {
  return (
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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
          gap: 12,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 18 }}>{title}</h3>
        {right}
      </div>
      {children}
    </div>
  );
}

function ActionButton({ children, onClick, disabled, danger = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        border: 0,
        borderRadius: 10,
        padding: "10px 14px",
        cursor: disabled ? "not-allowed" : "pointer",
        background: disabled ? "#cbd5e1" : danger ? "#dc2626" : "#2563eb",
        color: "#fff",
        fontWeight: 600,
      }}
    >
      {children}
    </button>
  );
}

function InfoGrid({ items }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 12,
      }}
    >
      {items.map((item) => (
        <div key={item.label}>
          <strong>{item.label}:</strong> {item.value || "-"}
        </div>
      ))}
    </div>
  );
}

export default function DoctorAppointmentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [patientFiles, setPatientFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [error, setError] = useState("");

  const appointmentId = Number(id);

  const patientId = appointment?.patient_id ?? null;
  const paymentStatus = appointment?.payment_status ?? "";
  const status = appointment?.status ?? "";
  const type = appointment?.type ?? "";
  const videoProvider = appointment?.video_provider ?? "";
  const meetingLink = appointment?.meeting_link ?? "";
  const doctorJoinedAt = appointment?.doctor_joined_at ?? null;

  const patientName =
    appointment?.patient_name ||
    [appointment?.patient_f_name, appointment?.patient_l_name]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    "-";

  const canShowVideoSection = type === "Video Consultant";

  const isClosedStatus = useMemo(() => {
    return ["Cancelled", "Rejected", "Completed", "Visited"].includes(status);
  }, [status]);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const appointmentRes = await getDoctorAppointmentById(appointmentId);
      const nextAppointment = appointmentRes?.data ?? null;

      setAppointment(nextAppointment);

      const nextPatientId = nextAppointment?.patient_id ?? null;

      if (nextPatientId) {
        try {
          const filesRes = await getDoctorPatientFiles(nextPatientId);
          setPatientFiles(filesRes?.data ?? []);
        } catch (_) {
          setPatientFiles([]);
        }
      } else {
        setPatientFiles([]);
      }
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Could not load appointment details."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!appointmentId) return;
    loadData();
  }, [appointmentId]);

  async function handleStatusChange(fn) {
    setActionLoading(true);
    try {
      await fn(appointmentId);
      await loadData();
    } catch (err) {
      alert(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Action failed."
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleStartVideo() {
    setVideoLoading(true);

    try {
      const res = await getDoctorVideoJoinData(appointmentId);

      if (!res?.status) {
        alert(res?.message || "Could not prepare video conference.");
        return;
      }

      const provider = String(res?.data?.provider || "").toLowerCase();
      const nextMeetingLink = res?.data?.meeting_link;
      const fallbackUsed = res?.fallback_used === true;

      if (fallbackUsed) {
        alert("Google failed. Switching to Agora.");
      }

      if (provider === "google" && nextMeetingLink) {
        window.open(nextMeetingLink, "_blank", "noopener,noreferrer");
        await loadData();
        return;
      }

      if (provider === "agora") {
        navigate(`/appointments/${appointmentId}/video`, {
          state: { joinData: res.data },
        });
        await loadData();
        return;
      }

      alert("Unsupported video provider.");
    } catch (err) {
      alert(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Could not start video conference."
      );
    } finally {
      setVideoLoading(false);
    }
  }

  if (loading) {
    return <div style={{ padding: 24 }}>Loading appointment details...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <div
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: 16,
            borderRadius: 12,
          }}
        >
          {error}
        </div>
      </div>
    );
  }

  if (!appointment) {
    return <div style={{ padding: 24 }}>Appointment not found.</div>;
  }

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            border: 0,
            background: "transparent",
            cursor: "pointer",
            color: "#2563eb",
            fontWeight: 600,
            padding: 0,
          }}
        >
          ← Back
        </button>
      </div>

      <SectionCard
        title={`Appointment #${appointment?.id ?? "-"}`}
        right={<StatusBadge value={status} />}
      >
        <InfoGrid
          items={[
            { label: "Date", value: appointment?.date },
            { label: "Time", value: appointment?.time_slots },
            { label: "Type", value: appointment?.type },
            { label: "Payment", value: paymentStatus },
            { label: "Clinic", value: appointment?.clinic_name || appointment?.clinic_id },
            {
              label: "Department",
              value: appointment?.department_name || appointment?.dept_id,
            },
            { label: "Source", value: appointment?.source },
            { label: "Duration", value: appointment?.duration_minutes },
          ]}
        />
      </SectionCard>

      <SectionCard title="Patient">
        <InfoGrid
          items={[
            { label: "Patient ID", value: patientId },
            { label: "Name", value: patientName },
            { label: "Phone", value: appointment?.patient_phone },
            { label: "Email", value: appointment?.patient_email },
          ]}
        />
      </SectionCard>

      <SectionCard title="Actions">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <ActionButton
            disabled={actionLoading || isClosedStatus || status === "Confirmed"}
            onClick={() => handleStatusChange(confirmDoctorAppointment)}
          >
            Confirm
          </ActionButton>

          <ActionButton
            disabled={actionLoading || isClosedStatus}
            onClick={() => handleStatusChange(completeDoctorAppointment)}
          >
            Complete
          </ActionButton>

          <ActionButton
            disabled={actionLoading || isClosedStatus}
            danger
            onClick={() => handleStatusChange(cancelDoctorAppointment)}
          >
            Cancel
          </ActionButton>
        </div>
      </SectionCard>

      {canShowVideoSection && (
        <SectionCard title="Video Conference">
          <InfoGrid
            items={[
              { label: "Provider", value: videoProvider },
              { label: "Meeting Link", value: meetingLink },
              { label: "Doctor Joined", value: doctorJoinedAt },
              {
                label: "Join Window Opens",
                value: appointment?.video_join_open_at,
              },
              {
                label: "Join Window Closes",
                value: appointment?.video_join_close_at,
              },
            ]}
          />

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
            <ActionButton
              disabled={
                videoLoading ||
                isClosedStatus ||
                type !== "Video Consultant" ||
                String(paymentStatus || "").toLowerCase() !== "paid"
              }
              onClick={handleStartVideo}
            >
              {videoLoading ? "Preparing..." : "Start Video Conference"}
            </ActionButton>
          </div>
        </SectionCard>
      )}

      <SectionCard title="Patient Files">
        {patientFiles.length === 0 ? (
          <div>No files available.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {patientFiles.map((file) => {
              const url = file?.file_url || file?.url || file?.file || "#";
              const name =
                file?.title || file?.name || file?.file_name || "File";

              return (
                <div
                  key={file?.id ?? `${name}-${url}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 12,
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{name}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      {file?.created_at || ""}
                    </div>
                  </div>

                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      textDecoration: "none",
                      color: "#2563eb",
                      fontWeight: 600,
                    }}
                  >
                    Open
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
}