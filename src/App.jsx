import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import logoBomberos from "./assets/logo_bomberos.png";

// ── Páginas Ciudadano ────────────────────────────────────────────────────────
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Reportar from "./pages/Reportar";
import MisReportes from "./pages/MisReportes";

// ── Páginas Operador ─────────────────────────────────────────────────────────
import Dashboard from "./pages/Dashboard";
import ReportesOperador from "./pages/ReportesOperador";
import TicketDetalle from "./pages/TicketDetalle";

// ── Páginas Administrador ────────────────────────────────────────────────────
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem("auth");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (data) => {
    setAuth(data);
    localStorage.setItem("auth", JSON.stringify(data));
  };

  const logout = () => {
    setAuth(null);
    localStorage.removeItem("auth");
  };

  // ── Interceptor global: auto-logout si el token expira o el usuario fue eliminado ──
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          logout();
        }
        return Promise.reject(error);
      },
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  // ── Redirección inicial según rol ─────────────────────────────────────────
  const homeByRole = (rol) => {
    if (rol === "CIUDADANO") return "/reportar";
    if (rol === "OPERADOR") return "/dashboard";
    if (rol === "ADMINISTRADOR") return "/admin";
    return "/login";
  };

  return (
    <Router>
      <div className="app-container">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        {auth && (
          <header
            className="app-header glass-panel"
            style={{
              borderRadius: 0,
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
            }}
          >
            <div className="container header-content">
              <div className="brand">
                <img
                  className="header-logo"
                  src={logoBomberos}
                  alt="Logo Bomberos"
                  style={{
                    width: "82px",
                    height: "82px",
                    marginRight: "14px",
                  }}
                />
                <div className="brand-text" style={{ lineHeight: 1.15 }}>
                  <h3
                    className="brand-title"
                    style={{
                      color: "var(--text-main)",
                      fontWeight: 700,
                      margin: 0,
                      fontSize: "1.25rem",
                    }}
                  >
                    Central de Emergencias
                  </h3>

                  <span
                    className="brand-subtitle"
                    style={{
                      color: "#6B7280",
                      fontSize: "0.82rem",
                      fontWeight: 500,
                      letterSpacing: "0.3px",
                    }}
                  >
                    Cuerpo General de Bomberos del Perú
                  </span>
                </div>
              </div>

              <div
                className="header-actions"
                style={{ display: "flex", gap: "24px", alignItems: "center" }}
              >
                {/* Nav Ciudadano */}
                {auth.rol === "CIUDADANO" && (
                  <nav
                    className="header-nav"
                    style={{
                      display: "flex",
                      gap: "28px",
                      alignItems: "center",
                    }}
                  >
                    <Link
                      to="/reportar"
                      className="nav-link"
                      style={{
                        color: "var(--text-main)",
                        textDecoration: "none",
                        fontSize: "1rem",
                        fontWeight: 700,
                        letterSpacing: "0.2px",
                      }}
                    >
                      Nuevo Reporte
                    </Link>
                    <Link
                      to="/mis-reportes"
                      className="nav-link"
                      style={{
                        color: "var(--text-main)",
                        textDecoration: "none",
                        fontSize: "1rem",
                        fontWeight: 700,
                        letterSpacing: "0.2px",
                      }}
                    >
                      Mis Reportes
                    </Link>
                  </nav>
                )}

                {/* Nav Operador */}
                {auth.rol === "OPERADOR" && (
                  <nav
                    className="header-nav"
                    style={{
                      display: "flex",
                      gap: "28px",
                      alignItems: "center",
                    }}
                  >
                    <Link
                      to="/dashboard"
                      className="nav-link"
                      style={{
                        color: "var(--text-main)",
                        textDecoration: "none",
                        fontSize: "1rem",
                        fontWeight: 700,
                        letterSpacing: "0.2px",
                      }}
                    >
                      Monitor de Mapa
                    </Link>
                    <Link
                      to="/reportes-pendientes"
                      className="nav-link"
                      style={{
                        color: "var(--text-main)",
                        textDecoration: "none",
                        fontSize: "1rem",
                        fontWeight: 700,
                        letterSpacing: "0.2px",
                      }}
                    >
                      Bandeja de Reportes
                    </Link>
                  </nav>
                )}

                {/* Nav Administrador */}
                {auth.rol === "ADMINISTRADOR" && (
                  <nav
                    className="header-nav"
                    style={{
                      display: "flex",
                      gap: "28px",
                      alignItems: "center",
                    }}
                  ></nav>
                )}

                {/* Usuario + Salir */}
                <div
                  className="header-user"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "16px",
                  }}
                >
                  <div
                    className="header-user-info"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        color: "var(--text-main)",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      👤 {auth.nombreCompleto}
                    </span>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "999px",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        letterSpacing: "0.5px",
                        background:
                          auth.rol === "ADMINISTRADOR"
                            ? "#F3E8FF"
                            : auth.rol === "OPERADOR"
                              ? "#DCFCE7"
                              : "#FEE2E2",
                        color:
                          auth.rol === "ADMINISTRADOR"
                            ? "#7E22CE"
                            : auth.rol === "OPERADOR"
                              ? "#15803D"
                              : "#CE2029",
                      }}
                    >
                      {auth.rol === "ADMINISTRADOR" ? "ADMIN" : auth.rol}
                    </span>
                  </div>
                  <button
                    className="btn-secondary logout-button"
                    onClick={logout}
                    style={{
                      padding: "8px 16px",
                      fontSize: "0.82rem",
                    }}
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* ── Rutas ──────────────────────────────────────────────────────── */}
        <main
          className="container app-main"
          style={{ paddingTop: "40px", paddingBottom: "60px" }}
        >
          <Routes>
            {/* Públicas */}
            <Route
              path="/login"
              element={
                !auth ? (
                  <Login onLogin={login} />
                ) : (
                  <Navigate to={homeByRole(auth.rol)} />
                )
              }
            />
            <Route
              path="/registro"
              element={
                !auth ? (
                  <Registro onLogin={login} />
                ) : (
                  <Navigate to={homeByRole(auth.rol)} />
                )
              }
            />
            <Route
              path="/forgot-password"
              element={
                !auth ? (
                  <ForgotPassword />
                ) : (
                  <Navigate to={homeByRole(auth.rol)} />
                )
              }
            />

            <Route
              path="/reset-password"
              element={
                !auth ? (
                  <ResetPassword />
                ) : (
                  <Navigate to={homeByRole(auth.rol)} />
                )
              }
            />
            <Route
              path="/verify-email"
              element={
                !auth ? <VerifyEmail /> : <Navigate to={homeByRole(auth.rol)} />
              }
            />

            {/* ── Ciudadano ── */}
            <Route
              path="/reportar"
              element={
                auth?.rol === "CIUDADANO" ? (
                  <Reportar auth={auth} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/mis-reportes"
              element={
                auth?.rol === "CIUDADANO" ? (
                  <MisReportes auth={auth} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            {/* ── Operador ── */}
            <Route
              path="/dashboard"
              element={
                auth?.rol === "OPERADOR" ? (
                  <Dashboard auth={auth} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/reportes-pendientes"
              element={
                auth?.rol === "OPERADOR" ? (
                  <ReportesOperador auth={auth} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/ticket/:id"
              element={
                auth?.rol === "OPERADOR" ? (
                  <TicketDetalle auth={auth} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            {/* ── Administrador ── */}
            <Route
              path="/admin"
              element={
                auth?.rol === "ADMINISTRADOR" ? (
                  <AdminDashboard auth={auth} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            {/* Fallback */}
            <Route
              path="*"
              element={<Navigate to={auth ? homeByRole(auth.rol) : "/login"} />}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
