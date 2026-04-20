import { useEffect, useState } from "react";
import { getDoctorReviews } from "../../api/reviewsApi";

function Stars({ value }) {
  const rating = Number(value || 0);

  return (
    <div style={{ letterSpacing: 2, color: "#f59e0b", fontSize: 16 }}>
      {"★".repeat(Math.max(0, Math.min(5, Math.round(rating))))}
      <span style={{ color: "#cbd5e1" }}>
        {"★".repeat(Math.max(0, 5 - Math.round(rating)))}
      </span>
    </div>
  );
}

function ReviewCard({ item }) {
  const patientName =
    item?.patient_name ||
    [item?.patient_f_name, item?.patient_l_name].filter(Boolean).join(" ") ||
    "Patient";

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: 16,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
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
        <div>
          <div style={{ fontWeight: 700, color: "#0f172a" }}>{patientName}</div>
          <div style={{ marginTop: 8 }}>
            <Stars value={item?.rating} />
          </div>
        </div>

        <div style={{ fontSize: 12, color: "#64748b" }}>
          {item?.created_at || item?.createdAt || ""}
        </div>
      </div>

      <div
        style={{
          marginTop: 12,
          color: "#475569",
          lineHeight: 1.5,
          whiteSpace: "pre-wrap",
        }}
      >
        {item?.review || item?.comment || item?.feedback || "-"}
      </div>
    </div>
  );
}

export default function DoctorReviewsPage() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const res = await getDoctorReviews({ page });
      const payload = res?.data ?? {};
      setItems(payload?.data ?? []);
      setMeta(payload);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not load reviews.");
      setItems([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [page]);

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Reviews</h1>
        <p style={{ marginTop: 8, color: "#64748b" }}>
          Read feedback written for your doctor profile.
        </p>
      </div>

      {loading ? (
        <div>Loading reviews...</div>
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
          No reviews found.
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gap: 12 }}>
            {items.map((item) => (
              <ReviewCard key={item?.id} item={item} />
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