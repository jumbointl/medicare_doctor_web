import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

function SidebarLink({ to, children }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      style={({ isActive }) => ({
        display: "block",
        padding: "12px 14px",
        borderRadius: 12,
        textDecoration: "none",
        fontWeight: 600,
        background: isActive ? "#2563eb" : "transparent",
        color: isActive ? "#fff" : "#0f172a",
      })}
    >
      {children}
    </NavLink>
  );
}

export default function DoctorLayout() {
  const navigate = useNavigate();
  const { user, doctor, logout } = useAuth();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        display: "grid",
        gridTemplateColumns: "260px 1fr",
      }}
    >
      <aside
        style={{
          borderRight: "1px solid #e2e8f0",
          background: "#fff",
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 22 }}>Doctor Portal</h2>
          <p style={{ marginTop: 8, color: "#64748b", fontSize: 14 }}>
            medicare_doctor_web
          </p>
        </div>

        <div
          style={{
            padding: 14,
            borderRadius: 16,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
            {user?.name || user?.f_name || user?.email || "Doctor"}
          </div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
            {user?.email || "-"}
          </div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
            Video Provider: {doctor?.video_provider || doctor?.videoProvider || "agora"}
          </div>
        </div>

        <nav style={{ display: "grid", gap: 8 }}>
          <SidebarLink to="/">Dashboard</SidebarLink>
          <SidebarLink to="/appointments">Appointments</SidebarLink>
          <SidebarLink to="/notifications">Notifications</SidebarLink>
          <SidebarLink to="/reviews">Reviews</SidebarLink>
          <SidebarLink to="/profile">Profile</SidebarLink>
        </nav>

        <div style={{ marginTop: "auto" }}>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              border: 0,
              borderRadius: 12,
              padding: "12px 14px",
              cursor: "pointer",
              background: "#dc2626",
              color: "#fff",
              fontWeight: 700,
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      <main style={{ minWidth: 0 }}>
        <header
          style={{
            height: 72,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            borderBottom: "1px solid #e2e8f0",
            background: "#fff",
          }}
        >
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>
              Doctor Workspace
            </div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
              Manage your own appointments, files, and video consultations
            </div>
          </div>

          <div
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              background: "#eff6ff",
              color: "#1d4ed8",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            Doctor ID: {doctor?.id || "-"}
          </div>
        </header>

        <div style={{ padding: 0 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}