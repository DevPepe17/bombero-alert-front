import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import logoBomberos from "../assets/logo_bomberos.png";

const API_URL =
  import.meta.env.VITE_API_URL || "https://bombero-alert-api.onrender.com/api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [estado, setEstado] = useState("validando");
  const [mensaje, setMensaje] = useState("Verificando tu cuenta...");

  useEffect(() => {
    const verificarCuenta = async () => {
      if (!token) {
        setEstado("error");
        setMensaje("El enlace de verificación no es válido.");
        return;
      }

      try {
        await axios.get(`${API_URL}/auth/verify-email`, {
          params: { token },
        });

        setEstado("ok");
        setMensaje("Tu cuenta fue verificada correctamente.");
      } catch (err) {
        setEstado("error");
        setMensaje(
          err.response?.data?.message ||
            "El enlace de verificación expiró o ya fue utilizado."
        );
      }
    };

    verificarCuenta();
  }, [token]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
      <div className="glass-panel animate-fade-in" style={{ width: "100%", maxWidth: "420px", padding: "40px", textAlign: "center" }}>
        <img
          src={logoBomberos}
          alt="Logo Bomberos"
          style={{ width: "64px", height: "64px", objectFit: "contain", margin: "0 auto 20px auto" }}
        />

        <h2 className="gradient-text" style={{ fontSize: "1.7rem", marginBottom: "12px" }}>
          Verificación de Cuenta
        </h2>

        <div style={{ fontSize: "48px", marginBottom: "16px" }}>
          {estado === "validando" ? "⏳" : estado === "ok" ? "✅" : "⚠️"}
        </div>

        <p style={{ color: estado === "ok" ? "#4ade80" : estado === "error" ? "var(--primary)" : "var(--text-muted)", marginBottom: "28px" }}>
          {mensaje}
        </p>

        {estado !== "validando" && (
          <Link
            to="/login"
            className="btn-primary"
            style={{
              display: "inline-block",
              width: "100%",
              textDecoration: "none",
              padding: "12px",
              borderRadius: "10px",
            }}
          >
            Ir al login
          </Link>
        )}
      </div>
    </div>
  );
}