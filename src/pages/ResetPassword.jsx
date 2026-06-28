import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import logoBomberos from "../assets/logo_bomberos.png";

const API_URL =
  import.meta.env.VITE_API_URL || "https://bombero-alert-api.onrender.com/api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    if (!token) {
      setError("El enlace de recuperación no es válido.");
      return;
    }

    if (nuevaPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_URL}/auth/reset-password`, null, {
        params: {
          token,
          nuevaPassword,
        },
      });

      setMensaje("Contraseña actualizada correctamente. Redirigiendo al login...");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "No se pudo actualizar la contraseña. El enlace puede haber expirado."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
      }}
    >
      <div
        className="glass-panel animate-fade-in"
        style={{ width: "100%", maxWidth: "420px", padding: "40px" }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <img
            src={logoBomberos}
            alt="Logo Bomberos"
            style={{
              width: "64px",
              height: "64px",
              objectFit: "contain",
              margin: "0 auto 16px auto",
            }}
          />

          <h2
            className="gradient-text"
            style={{ fontSize: "1.7rem", marginBottom: "8px" }}
          >
            Nueva Contraseña
          </h2>

          <p style={{ color: "var(--text-muted)" }}>
            Ingresa una nueva contraseña para recuperar el acceso a tu cuenta.
          </p>
        </div>

        {!token && (
          <div
            style={{
              color: "var(--primary)",
              marginBottom: "16px",
              textAlign: "center",
            }}
          >
            El enlace de recuperación no es válido.
          </div>
        )}

        {mensaje && (
          <div
            style={{
              color: "#4ade80",
              marginBottom: "16px",
              textAlign: "center",
            }}
          >
            {mensaje}
          </div>
        )}

        {error && (
          <div
            style={{
              color: "var(--primary)",
              marginBottom: "16px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Nueva contraseña</label>
            <input
              type="password"
              className="input-control"
              placeholder="••••••••"
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              required
              disabled={!token}
            />
          </div>

          <div className="input-group">
            <label>Confirmar contraseña</label>
            <input
              type="password"
              className="input-control"
              placeholder="••••••••"
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              required
              disabled={!token}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: "100%", marginTop: "12px" }}
            disabled={loading || !token}
          >
            {loading ? "Actualizando..." : "Actualizar contraseña"}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <Link
            to="/login"
            style={{
              color: "var(--primary)",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Volver al login
          </Link>
        </div>
      </div>
    </div>
  );
}