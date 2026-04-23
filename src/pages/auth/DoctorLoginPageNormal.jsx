import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
}) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <label style={{ fontSize: 14, fontWeight: 600 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={{
          border: "1px solid #cbd5e1",
          borderRadius: 12,
          padding: "12px 14px",
          outline: "none",
          fontSize: 14,
          background: "#fff",
        }}
      />
    </div>
  );
}

function ErrorAlert({ message }) {
  if (!message) return null;

  return (
    <div
      style={{
        background: "#fee2e2",
        color: "#991b1b",
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        fontSize: 14,
      }}
    >
      {message}
    </div>
  );
}

function parseEmailFromJwt(token) {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const payload = JSON.parse(decodeBase64Url(parts[1]));
    return payload?.email || null;
  } catch (_) {
    return null;
  }
}

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + (4 - (normalized.length % 4 || 4)) % 4,
    "=",
  );
  return atob(padded);
}

export default function DoctorLoginPage() {
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

  const {
    isAuthenticated,
    loading: authLoading,
    loginWithPassword,
    loginWithGoogle,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    function renderGoogleButton() {
      const google = window.google;
      const container = googleButtonRef.current;
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

      if (!container || !google?.accounts?.id || !clientId) {
        setGoogleReady(false);
        return;
      }

      try {
        container.innerHTML = "";

        google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (cancelled) return;
            await handleGoogleCredential(response?.credential || null);
          },
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: true,
        });

        google.accounts.id.renderButton(container, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          width: 380,
          logo_alignment: "left",
        });

        setGoogleReady(true);
      } catch (err) {
        console.error("Could not render Google button", err);
        setGoogleReady(false);
      }
    }

    renderGoogleButton();

    return () => {
      cancelled = true;
    };
  }, [authLoading]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await loginWithPassword({
        email: email.trim(),
        password,
      });

      if (!res?.status) {
        setError(res?.message || "Login failed.");
        return;
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleCredential(idToken) {
    setError("");

    if (!idToken) {
      setError("Could not get Google token.");
      return;
    }

    setGoogleSubmitting(true);

    try {
      const emailFromJwt = parseEmailFromJwt(idToken);

      if (!emailFromJwt) {
        setError("Could not read Google email.");
        return;
      }

      const res = await loginWithGoogle({
        id_token: idToken,
        email: emailFromJwt,
      });

      if (!res?.status) {
        setError(res?.message || "Google login failed.");
        return;
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Google login failed.");
    } finally {
      setGoogleSubmitting(false);
    }
  }

  if (authLoading) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#fff",
          borderRadius: 24,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          padding: 28,
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 28 }}>Doctor Login</h1>
          <p style={{ marginTop: 8, color: "#64748b", lineHeight: 1.5 }}>
            Sign in to manage your appointments, patient files, and video consultations.
          </p>
        </div>

        <ErrorAlert message={error} />

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <InputField
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="doctor@example.com"
            autoComplete="email"
          />

          <InputField
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Enter your password"
            autoComplete="current-password"
          />

          <button
            type="submit"
            disabled={submitting || googleSubmitting}
            style={{
              border: 0,
              borderRadius: 12,
              padding: "12px 16px",
              cursor: submitting || googleSubmitting ? "not-allowed" : "pointer",
              background: submitting || googleSubmitting ? "#94a3b8" : "#2563eb",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            margin: "18px 0",
          }}
        >
          <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
          <span style={{ fontSize: 13, color: "#64748b" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
        </div>

        <div
          style={{
            display: "grid",
            gap: 10,
          }}
        >
          <div
            ref={googleButtonRef}
            style={{
              display: "flex",
              justifyContent: "center",
              minHeight: 44,
              opacity: googleSubmitting ? 0.7 : 1,
              pointerEvents: googleSubmitting ? "none" : "auto",
            }}
          />

          {!googleReady ? (
            <div
              style={{
                fontSize: 13,
                color: "#92400e",
                background: "#fef3c7",
                borderRadius: 12,
                padding: 12,
              }}
            >
              Google Sign-In is not available right now. You can still log in with email and password.
            </div>
          ) : null}

          {googleSubmitting ? (
            <div
              style={{
                fontSize: 13,
                color: "#2563eb",
                textAlign: "center",
              }}
            >
              Connecting Google...
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}