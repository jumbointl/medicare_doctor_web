import { useEffect, useMemo, useRef, useState } from "react";
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
  const googlePromptRef = useRef(false);

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
  const [googleDebug, setGoogleDebug] = useState(null);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const showGoogleDebug = import.meta.env.VITE_SHOW_GOOGLE_DEBUG === "true";

  const maskedClientId = useMemo(() => {
    if (!clientId || typeof clientId !== "string") return "(missing)";
    return `${clientId.slice(0, 5)}...`;
  }, [clientId]);

  function debugLog(...args) {
    if (showGoogleDebug) {
      console.log(...args);
    }
  }

  function logGoogleDiagnostics(extra = {}) {
    const debugData = {
      mode: import.meta.env.MODE,
      origin: window.location.origin,
      href: window.location.href,
      hasClientId: !!clientId,
      clientIdPreview: maskedClientId,
      hasGoogleObject: !!window.google,
      hasGoogleAccounts: !!window.google?.accounts,
      hasGoogleAccountsId: !!window.google?.accounts?.id,
      hasContainer: !!googleButtonRef.current,
      isSecureContext: window.isSecureContext,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      ...extra,
    };

    debugLog("[Google Sign-In][diagnostics]", debugData);
    if (showGoogleDebug) {
      setGoogleDebug(debugData);
    }
    return debugData;
  }

  useEffect(() => {
    if (!showGoogleDebug) return undefined;

    const onWindowError = (event) => {
      console.error("[window error]", event.message, event.error);
    };

    const onUnhandledRejection = (event) => {
      console.error("[unhandled rejection]", event.reason);
    };

    window.addEventListener("error", onWindowError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("error", onWindowError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, [showGoogleDebug]);

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

      logGoogleDiagnostics({ phase: "initial-check" });

      if (!container) {
        console.error("[Google Sign-In] Missing container element");
        setGoogleReady(false);
        logGoogleDiagnostics({ phase: "missing-container" });
        return;
      }

      if (!google?.accounts?.id) {
        console.error("[Google Sign-In] Google Identity script not loaded");
        setGoogleReady(false);
        logGoogleDiagnostics({ phase: "missing-google-script" });
        return;
      }

      if (!clientId) {
        console.error("[Google Sign-In] VITE_GOOGLE_CLIENT_ID is missing in build");
        setGoogleReady(false);
        logGoogleDiagnostics({ phase: "missing-client-id" });
        return;
      }

      try {
        container.innerHTML = "";

        google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (cancelled) return;

            debugLog("[Google Sign-In] callback response received", {
              hasCredential: !!response?.credential,
              selectBy: response?.select_by,
              clientIdPreview: maskedClientId,
              origin: window.location.origin,
            });

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

        if (!googlePromptRef.current && typeof google.accounts.id.prompt === "function") {
          googlePromptRef.current = true;
          google.accounts.id.prompt((notification) => {
            const promptData = {
              isNotDisplayed: notification?.isNotDisplayed?.(),
              isSkippedMoment: notification?.isSkippedMoment?.(),
              isDismissedMoment: notification?.isDismissedMoment?.(),
              notDisplayedReason: notification?.getNotDisplayedReason?.(),
              skippedReason: notification?.getSkippedReason?.(),
              dismissedReason: notification?.getDismissedReason?.(),
            };
            debugLog("[Google Sign-In] prompt notification", promptData);
            logGoogleDiagnostics({ phase: "prompt", ...promptData });
          });
        }

        setGoogleReady(true);
        logGoogleDiagnostics({ phase: "rendered-button" });
      } catch (err) {
        console.error("Could not render Google button", err);
        setGoogleReady(false);
        logGoogleDiagnostics({
          phase: "initialize-error",
          errorMessage: err?.message || String(err),
        });
      }
    }

    const timer = window.setTimeout(renderGoogleButton, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [authLoading, clientId, maskedClientId]);

  async function handleSubmit(event) 
  {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    setSubmitting(true);

    try {
      console.log("DOCTOR_LOGIN request", { email });

      const res = await loginWithPassword({
        email: email.trim(),
        password,
      });

      console.log("DOCTOR_LOGIN response", res);

      if (!res?.status) {
        setError(res?.message || "Login failed.");
        return;
      }

      const token = res?.token;
      const userData = res?.data;

      console.log("DOCTOR_LOGIN token", token);
      console.log("DOCTOR_LOGIN userData", userData);

      if (!token || !userData) {
        setError("Login response is incomplete.");
        return;
      }

      localStorage.setItem("doctor_web_token", token);
      localStorage.setItem("doctor_web_user", JSON.stringify(userData));

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.log("DOCTOR_LOGIN error full", err);
      console.log("DOCTOR_LOGIN error response", err?.response);
      console.log("DOCTOR_LOGIN error data", err?.response?.data);
      setError(err?.response?.data?.message || err?.message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleCredential(idToken) {
    setError("");

    if (!idToken) {
      console.error("[Google Sign-In] Missing ID token in callback");
      setError("Could not get Google token.");
      return;
    }

    setGoogleSubmitting(true);

    try {
      const emailFromJwt = parseEmailFromJwt(idToken);

      debugLog("[Google Sign-In] Parsed token payload", {
        hasEmailFromJwt: !!emailFromJwt,
        emailPreview: emailFromJwt ? `${emailFromJwt.slice(0, 5)}...` : null,
      });

      if (!emailFromJwt) {
        setError("Could not read Google email.");
        return;
      }

      const res = await loginWithGoogle({
        id_token: idToken,
        email: emailFromJwt,
      });

      debugLog("[Google Sign-In] Backend login response", {
        status: res?.status,
        hasMessage: !!res?.message,
      });

      if (!res?.status) {
        setError(res?.message || "Google login failed.");
        return;
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("[Google Sign-In] handleGoogleCredential error", err);
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

            {showGoogleDebug ? (
            <>
              <div
                style={{
                  marginTop: 8,
                  padding: 12,
                  borderRadius: 12,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                  lineHeight: 1.5,
                  color: "#334155",
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Google debug</div>
                <div>mode: {import.meta.env.MODE}</div>
                <div>origin: {typeof window !== "undefined" ? window.location.origin : ""}</div>
                <div>clientId: {maskedClientId}</div>
                <div>google loaded: {String(!!window.google)}</div>
                <div>google.accounts.id loaded: {String(!!window.google?.accounts?.id)}</div>
                <div>container found: {String(!!googleButtonRef.current)}</div>
              </div>

              {googleDebug ? (
                <pre
                  style={{
                    margin: 0,
                    padding: 12,
                    borderRadius: 12,
                    background: "#0f172a",
                    color: "#e2e8f0",
                    overflowX: "auto",
                    fontSize: 11,
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {JSON.stringify(googleDebug, null, 2)}
                </pre>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
