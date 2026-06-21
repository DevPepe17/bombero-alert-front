import { useState, useEffect } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import L from "leaflet";
import MarcadorEmergencia from "../assets/marcador_emergencia.png";
import EstacionBomberos from "../assets/estacion_bomberos.png";

const API_URL =
  import.meta.env.VITE_API_URL || "https://bombero-alert-api.onrender.com/api";

// Custom icons for Map
const reportIcon = new L.Icon({
  iconUrl: MarcadorEmergencia,
  iconSize: [64, 64],
  iconAnchor: [32, 64],
  popupAnchor: [0, -55],
});

const estacionIcon = new L.Icon({
  iconUrl: EstacionBomberos,
  iconSize: [72, 72],
  iconAnchor: [36, 72],
  popupAnchor: [0, -65],
});

export default function Dashboard({ auth }) {
  const [reportes, setReportes] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [estaciones, setEstaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sectorSeleccionado, setSectorSeleccionado] = useState("TODOS");
  const [companiasAbiertas, setCompaniasAbiertas] = useState({});

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${auth.token}` };

      const [resReportes, resUnidades, resEstaciones] = await Promise.all([
        axios.get(`${API_URL}/reportes/pendientes`, { headers }),
        axios.get(`${API_URL}/unidades/disponibles`, { headers }),
        axios.get(`${API_URL}/estaciones`, { headers }), // Obtenemos las estaciones para mostrarlas en el mapa
      ]);

      const reportesOperativos = resReportes.data.filter(
        (rep) =>
          rep.estado === "EN_COLA" ||
          rep.estado === "ACTIVO" ||
          rep.estado === "PENDIENTE",
      );
      setReportes(reportesOperativos);
      setUnidades(resUnidades.data);
      setEstaciones(resEstaciones.data); // Visualizamos las estaciones en el mapa.
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, [auth.token]);

  const reportesVisibles = reportes.slice(0, 4);

  const obtenerSector = (distrito) => {
    const limaSur = [
      "Chorrillos",
      "Barranco",
      "Miraflores",
      "San Juan de Miraflores",
      "Santiago de Surco",
    ];

    const limaCentro = ["Cercado de Lima", "Breña", "Magdalena"];

    const callao = ["Bellavista"];

    if (limaSur.includes(distrito)) return "LIMA_SUR";
    if (limaCentro.includes(distrito)) return "LIMA_CENTRO";
    if (callao.includes(distrito)) return "CALLAO";

    return "LIMA_NORTE";
  };

  const estacionesFiltradas =
    sectorSeleccionado === "TODOS"
      ? estaciones
      : estaciones.filter(
          (estacion) => obtenerSector(estacion.distrito) === sectorSeleccionado,
        );

  const estacionesPorSector = estaciones.reduce((acc, estacion) => {
    const sector = obtenerSector(estacion.distrito);

    if (!acc[sector]) {
      acc[sector] = [];
    }

    acc[sector].push(estacion);
    return acc;
  }, {});

  const sectoresOrdenados = [
    { key: "LIMA_SUR", label: "Lima Sur" },
    { key: "LIMA_CENTRO", label: "Lima Centro" },
    { key: "LIMA_NORTE", label: "Lima Norte" },
    { key: "CALLAO", label: "Callao" },
  ];

  const unidadesAgrupadas = estacionesFiltradas.map((estacion) => ({
    ...estacion,
    unidadesDisponibles: unidades.filter(
      (u) => u.nombreEstacion === estacion.nombre,
    ),
  }));

  const extraerNumeroCompania = (nombre) => {
    const match = nombre.match(/N°\s*(\d+)/);
    return match ? Number(match[1]) : 999;
  };

  const unidadesAgrupadasOrdenadas = [...unidadesAgrupadas].sort(
    (a, b) => extraerNumeroCompania(a.nombre) - extraerNumeroCompania(b.nombre),
  );
  const toggleCompania = (id) => {
    setCompaniasAbiertas((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "350px 1fr",
        gap: "24px",
        height: "80vh",
      }}
    >
      {/* Sidebar - Panel de Control */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          overflowY: "auto",
        }}
      >
        <div className="glass-panel" style={{ padding: "24px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h3 className="gradient-text" style={{ margin: 0 }}>
              Reportes Pendientes ({reportes.length})
            </h3>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {reportes.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                No hay reportes pendientes.
              </p>
            ) : (
              reportesVisibles.map((rep) => (
                <div
                  key={rep.id}
                  style={{
                    background: "rgba(0,0,0,0.3)",
                    padding: "16px",
                    borderRadius: "12px",
                    borderLeft: "4px solid var(--primary)",
                  }}
                >
                  <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
                    {rep.tipoIncidente}
                  </div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                      marginBottom: "8px",
                    }}
                  >
                    {new Date(rep.timestamp).toLocaleTimeString()}
                  </div>
                  {rep.descripcion && (
                    <div
                      style={{
                        fontSize: "0.9rem",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      "{rep.descripcion}"
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <Link
            to="/reportes-pendientes"
            className="btn-secondary"
            style={{
              width: "100%",
              marginTop: "16px",
              padding: "10px",
              fontSize: "0.9rem",
              textDecoration: "none",
              display: "block",
              textAlign: "center",
            }}
          >
            Abrir Bandeja de Reportes...
          </Link>
        </div>

        <div className="glass-panel" style={{ padding: "24px" }}>
          <h3 className="gradient-text" style={{ marginBottom: "4px" }}>
            Disponibilidad por Compañía
          </h3>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.8rem",
              marginBottom: "16px",
            }}
          >
            {sectorSeleccionado === "TODOS"
              ? "Mostrando todos los sectores"
              : `Mostrando ${sectoresOrdenados.find((s) => s.key === sectorSeleccionado)?.label}`}
          </p>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {unidadesAgrupadasOrdenadas.map((estacion) => {
              const abierta = companiasAbiertas[estacion.id];

              return (
                <div
                  key={estacion.id}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: "10px",
                    padding: "12px",
                  }}
                >
                  <div
                    onClick={() => toggleCompania(estacion.id)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      fontWeight: 700,
                      color: "var(--primary)",
                    }}
                  >
                    <span>🚒 {estacion.nombre}</span>
                    <span
                      style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}
                    >
                      {abierta ? "▼" : "▶"}{" "}
                      {estacion.unidadesDisponibles.length}
                    </span>
                  </div>

                  {!abierta && (
                    <div
                      style={{
                        marginTop: "6px",
                        color: "var(--text-muted)",
                        fontSize: "0.8rem",
                      }}
                    >
                      🟢 {estacion.unidadesDisponibles.length} unidades
                      disponibles
                    </div>
                  )}

                  {abierta && (
                    <div style={{ marginTop: "10px" }}>
                      {estacion.unidadesDisponibles.length === 0 ? (
                        <div
                          style={{
                            color: "var(--text-muted)",
                            fontSize: "0.85rem",
                          }}
                        >
                          Sin unidades disponibles
                        </div>
                      ) : (
                        estacion.unidadesDisponibles.map((u) => (
                          <div
                            key={u.id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              padding: "6px 0",
                              fontSize: "0.85rem",
                            }}
                          >
                            <span>
                              🟢 <strong>{u.codigo}</strong>
                            </span>
                            <span style={{ color: "var(--text-muted)" }}>
                              {u.tipo}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Map */}
      <div
        className="glass-panel"
        style={{ height: "100%", overflow: "hidden", position: "relative" }}
      >
        <div
          style={{
            position: "absolute",
            top: "16px",
            left: "16px",
            zIndex: 1000,
            background: "rgba(0,0,0,0.75)",
            padding: "10px",
            borderRadius: "10px",
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          {[
            { key: "TODOS", label: "Todos" },
            { key: "LIMA_SUR", label: "Lima Sur" },
            { key: "LIMA_CENTRO", label: "Lima Centro" },
            { key: "LIMA_NORTE", label: "Lima Norte" },
            { key: "CALLAO", label: "Callao" },
          ].map((sector) => (
            <button
              key={sector.key}
              onClick={() => setSectorSeleccionado(sector.key)}
              style={{
                padding: "6px 12px",
                borderRadius: "20px",
                border:
                  sectorSeleccionado === sector.key
                    ? "1px solid var(--primary)"
                    : "1px solid var(--surface-border)",
                background:
                  sectorSeleccionado === sector.key
                    ? "rgba(255, 59, 48, 0.25)"
                    : "rgba(255,255,255,0.08)",
                color:
                  sectorSeleccionado === sector.key
                    ? "var(--primary)"
                    : "white",
                cursor: "pointer",
                fontSize: "0.8rem",
                fontWeight: 600,
              }}
            >
              {sector.label}
            </button>
          ))}
        </div>
        <MapContainer
          center={[-12.046374, -77.029851]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {reportes.map((rep) => (
            <Marker
              key={rep.id}
              position={[rep.latitud, rep.longitud]}
              icon={reportIcon}
            >
              <Popup>
                <div style={{ color: "black" }}>
                  <strong>{rep.tipoIncidente}</strong>
                  <br />
                  Reporte Pendiente
                </div>
              </Popup>
            </Marker>
          ))}
          {estacionesFiltradas.map((estacion) => (
            <Marker
              key={`estacion-${estacion.id}`}
              position={[estacion.latitud, estacion.longitud]}
              icon={estacionIcon}
            >
              <Popup>
                <div style={{ color: "black" }}>
                  <strong>{estacion.nombre}</strong>
                  <br />
                  Distrito: {estacion.distrito}
                  <br />
                  <br />
                  <strong>Unidades:</strong>
                  <br />
                  {estacion.unidades?.map((u) => (
                    <div key={u.id}>
                      {u.estado === "DISPONIBLE" ? "🟢" : "🔴"}{" "}
                      <strong>{u.codigo}</strong> - {u.tipo}
                    </div>
                  ))}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
