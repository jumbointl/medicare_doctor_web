import { useEffect, useState } from "react";
import {
  getDoctorNotifications,
  markDoctorNotificationSeen,
} from "../../api/notificationsApi";

function NotificationCard({ item, onSeen, busy }) {
  const isSeen =
    item?.seen_status === 1 ||
    item?.seen_status === true ||
    item?.seenStatus === 1 ||
    item?.seenStatus === true;

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: 16,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        border: isSeen ? "1px solid #e2e8f0" : "1px solid #bfdbfe",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "start",
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: "#0f172a" }}>
            {item?.title || item?.subject || "Notification"}
          </div>

          <div
            style={{
              marginTop: 8,
              color: "#475569",
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
            }}
          >
            {item?.description || item?.message || item?.body || "-"}
          </div>

          <div style={{ marginTop: 10, fontSize: 12, color: "#64748b" }}>
            {item?.created_at || item?.createdAt || ""}
          </div>
        </div>

        <div>
          {isSeen ? (
            <span
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                background: "#dcfce7",
                color: "#166534",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              Seen
            </span>
          ) : (
            <button
              onClick={() => onSeen(item?.id)}
              disabled={busy}
              style={{
                border: 0,
                borderRadius: 10,
                padding: "8px 12px",
                cursor: busy ? "not-allowed" : "pointer",
                background: busy ? "#94a3b8" : "#2563eb",
                color: "#fff",
                fontWeight: 700,
              }}
            >
              Mark seen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DoctorNotificationsPage() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [seenLoadingId, setSeenLoadingId] = useState(null);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const res = await getDoctorNotifications({ page });
      const payload = res?.data ?? {};
      setItems(payload?.data ?? []);
      setMeta(payload);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not load notifications.");
      setItems([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [page]);

  async function handleMarkSeen(id) {
    if (!id) return;

    setSeenLoadingId(id);
    try {
      await markDoctorNotificationSeen(id);
      await loadData();
    } catch (err) {
      alert(err?.response?.data?.message || "Could not update notification.");
    } finally {
      setSeenLoadingId(null);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Notifications</h1>
        <p style={{ marginTop: 8, color: "#64748b" }}>
          Review your doctor notifications.
        </p>
      </div>

      {loading ? (
        <div>Loading notifications...</div>
      ) : error ? (
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
      ) : items.length === 0 ? (
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 20,
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          No notifications found.
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gap: 12 }}>
            {items.map((item) => (
              <NotificationCard
                key={item?.id}
                item={item}
                onSeen={handleMarkSeen}
                busy={seenLoadingId === item?.id}
              />
            ))}
          </div>

          {meta && (
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
        </>
      )}
    </div>
  );
}

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