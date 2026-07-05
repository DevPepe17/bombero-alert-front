import { useState, useEffect } from "react";
import axios from "axios";
import { Search, Info, MapPin } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import EstacionBomberos from "../assets/estacion_bomberos.png";

const API_URL =
  import.meta.env.VITE_API_URL || "https://bombero-alert-api.onrender.com/api";

const ESTADO_BADGE = {
  EN_COLA: { label: "En Cola", color: "#FF9500", bg: "rgba(255,149,0,0.2)" },
  ACTIVO: { label: "Activo", color: "#30D158", bg: "rgba(48,209,88,0.2)" },
  PENDIENTE: {
    label: "Pendiente",
    color: "#0A84FF",
    bg: "rgba(10,132,255,0.2)",
  },
  RESUELTO: { label: "Resuelto", color: "#34C759", bg: "rgba(52,199,89,0.2)" },
  CANCELADO: {
    label: "Cancelado",
    color: "#FF3B30",
    bg: "rgba(255,59,48,0.2)",
  },
};

const customIcon = new L.Icon({
  iconUrl:
    "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const estacionIcon = new L.Icon({
  iconUrl: EstacionBomberos,
  iconSize: [72, 72],
  iconAnchor: [36, 72],
  popupAnchor: [0, -65],
});

export default function MisReportes({ auth }) {
  const [reportes, setReportes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [estaciones, setEstaciones] = useState([]);

  useEffect(() => {
    const fetchReportes = async () => {
      try {
        const response = await axios.get(`${API_URL}/reportes/mis-reportes`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        setReportes(response.data);
        setSelectedReport(response.data[0] || null);
      } catch (error) {
        console.error("Error al cargar reportes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReportes();
  }, [auth.token]);

  useEffect(() => {
    const fetchEstaciones = async () => {
      try {
        const response = await axios.get(`${API_URL}/estaciones`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });
        setEstaciones(response.data);
      } catch (error) {
        console.error("Error al cargar estaciones:", error);
      }
    };
    fetchEstaciones();
  }, [auth.token]);

  const filteredReportes = reportes.filter(
    (rep) =>
      rep.tipoIncidente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rep.descripcion &&
        rep.descripcion.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  // force leaflet to recalculate size when report list changes
  function MapResizeHelper({ watch }) {
    const map = useMap();
    useEffect(() => {
      // small delay to allow layout to settle
      const t = setTimeout(() => {
        if (map && map.invalidateSize) map.invalidateSize();
      }, 120);
      return () => clearTimeout(t);
    }, [watch, map]);
    return null;
  }

  function MapFocus({ reporte }) {
    const map = useMap();

    useEffect(() => {
      if (!reporte) return;

      const lat = Number(reporte.latitud);
      const lng = Number(reporte.longitud);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      map.flyTo([lat, lng], 15, {
        duration: 0.8,
      });
    }, [reporte, map]);

    return null;
  }

  return (
    <div
      className="animate-fade-in"
      style={{ maxWidth: "1200px", margin: "0 auto" }}
    >
      <div style={{ marginBottom: "32px" }}>
        <h2
          className="page-title"
          style={{ fontSize: "2.2rem", marginBottom: "8px", fontWeight: 800 }}
        >
          Mis Reportes
        </h2>
        <p className="page-subtitle">
          Historial de las emergencias que has reportado.
        </p>
      </div>

      <div
        className="citizen-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
          gap: "32px",
          alignItems: "start",
        }}
      >
        {/* Lista de Reportes */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            minWidth: 0,
          }}
        >
          <div
            className="glass-panel"
            style={{
              padding: "16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: "#FFFFFF",
              border: "1.5px solid var(--surface-border)",
              boxShadow: "0 2px 8px rgba(13, 27, 42, 0.04)",
            }}
          >
            <Search color="var(--text-muted)" size={20} />
            <input
              type="text"
              placeholder="Buscar por tipo o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-main)",
                flex: 1,
                outline: "none",
                fontSize: "1rem",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              overflowY: "auto",
              flex: 1,
              paddingRight: "8px",
            }}
          >
            {loading ? (
              <p style={{ color: "var(--text-muted)" }}>
                Cargando historial...
              </p>
            ) : filteredReportes.length === 0 ? (
              <div
                className="glass-panel"
                style={{
                  padding: "32px",
                  textAlign: "center",
                  color: "var(--text-muted)",
                }}
              >
                <Info
                  size={40}
                  style={{ margin: "0 auto 16px auto", opacity: 0.5 }}
                />
                <p>No se encontraron reportes previos.</p>
              </div>
            ) : (
              filteredReportes.map((rep) => {
                const ec = ESTADO_BADGE[rep.estado] || ESTADO_BADGE["EN_COLA"];
                return (
                  <div
                    key={rep.id}
                    className="glass-panel card-hover"
                    onClick={() => setSelectedReport(rep)}
                    style={{
                      display: "flex",
                      overflow: "hidden",
                      padding: 0,
                      transition: "transform 0.2s",
                      cursor: "pointer",
                      border:
                        selectedReport?.id === rep.id
                          ? "2px solid var(--primary)"
                          : "1px solid var(--surface-border)",
                    }}
                  >
                    {/* Línea lateral de color según estado */}
                    <div
                      style={{
                        width: "6px",
                        background: ec.color,
                        flexShrink: 0,
                      }}
                    />

                    <div
                      style={{
                        padding: "20px",
                        display: "flex",
                        gap: "20px",
                        width: "100%",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "64px",
                          height: "64px",
                          background: "rgba(255,255,255,0.05)",
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <MapPin size={28} color="var(--primary)" />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "6px",
                            gap: "8px",
                          }}
                        >
                          <h4
                            style={{
                              fontSize: "1rem",
                              margin: 0,
                              fontWeight: 700,
                            }}
                          >
                            {rep.tipoIncidente}
                          </h4>
                          <span
                            style={{
                              fontSize: "0.72rem",
                              padding: "3px 8px",
                              background: ec.bg,
                              color: ec.color,
                              borderRadius: "10px",
                              fontWeight: 700,
                              whiteSpace: "nowrap",
                              flexShrink: 0,
                            }}
                          >
                            {ec.label}
                          </span>
                        </div>
                        <p
                          style={{
                            color: "var(--text-muted)",
                            fontSize: "0.88rem",
                            marginBottom: "6px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {rep.descripcion || "Sin descripción adicional"}
                        </p>
                        <span
                          style={{
                            fontSize: "0.78rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          {new Date(rep.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Mapa de Historial */}
        <div
          className="glass-panel"
          style={{
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            height: "min(62vh, 560px)",
            minHeight: "420px",
            maxHeight: "560px",
            alignSelf: "start",
            position: "sticky",
            top: "130px",
          }}
        >
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid var(--surface-border)",
              background: "rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ fontSize: "1.1rem" }}>Ubicación de tus reportes</h3>
          </div>
          <div style={{ flex: 1, width: "100%", minHeight: 0 }}>
            <MapContainer
              center={[-12.046374, -77.029851]}
              zoom={11}
              style={{
                height: "100%",
                width: "100%",
                zIndex: 1,
                borderRadius: 0,
              }}
            >
              <MapResizeHelper watch={filteredReportes.length} />
              <MapFocus reporte={selectedReport} />
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {selectedReport && (
                <Marker
                  key={selectedReport.id}
                  position={[
                    Number(selectedReport.latitud),
                    Number(selectedReport.longitud),
                  ]}
                  icon={customIcon}
                >
                  <Popup>
                    <div style={{ color: "black" }}>
                      <strong>{selectedReport.tipoIncidente}</strong>
                      <br />
                      Estado:{" "}
                      {ESTADO_BADGE[selectedReport.estado]?.label ||
                        selectedReport.estado}
                      <br />
                      {new Date(selectedReport.timestamp).toLocaleDateString()}
                    </div>
                  </Popup>
                </Marker>
              )}
              {estaciones
                .filter(
                  (estacion) =>
                    Number.isFinite(Number(estacion.latitud)) &&
                    Number.isFinite(Number(estacion.longitud)),
                )
                .map((estacion) => (
                  <Marker
                    key={`estacion-${estacion.id}`}
                    position={[
                      Number(estacion.latitud),
                      Number(estacion.longitud),
                    ]}
                    icon={estacionIcon}
                  >
                    <Popup>
                      <div style={{ color: "#0D1B2A", minWidth: "190px" }}>
                        <strong>{estacion.nombre}</strong>

                        <div style={{ marginTop: "8px", lineHeight: 1.5 }}>
                          <div>📍 {estacion.distrito}</div>
                          <div>🏠 {estacion.direccion}</div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
