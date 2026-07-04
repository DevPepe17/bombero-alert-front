import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import logoBomberos from "../assets/logo_bomberos.png";

const API_URL =
  import.meta.env.VITE_API_URL || "https://bombero-alert-api.onrender.com/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");
    setError("");

    try {
      await axios.post(`${API_URL}/auth/forgot-password`, null, {
        params: { email },
      });

      setMensaje("Se envió un enlace de recuperación a tu correo.");
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo enviar el correo.");
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
              width: "100px",
              height: "100px",
              objectFit: "contain",
              margin: "0 auto 18px auto",
            }}
          />
          <h2
            className="gradient-text"
            style={{ fontSize: "1.7rem", marginBottom: "8px" }}
          >
            Recuperar Contraseña
          </h2>
          <p style={{ color: "var(--text-muted)" }}>
            Ingresa tu correo y te enviaremos un enlace válido por 5 minutos.
          </p>
        </div>

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
            <label>Correo Electrónico</label>
            <input
              type="email"
              className="input-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: "100%", marginTop: "12px" }}
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar enlace"}
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
