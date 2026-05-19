import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';

const API_URL = import.meta.env.VITE_API_URL || 'https://bombero-alert-api.onrender.com/api';

// Custom icons for Map
const reportIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function Dashboard({ auth }) {
  const [reportes, setReportes] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${auth.token}` };
      
      const [resReportes, resUnidades] = await Promise.all([
        axios.get(`${API_URL}/reportes/pendientes`, { headers }),
        axios.get(`${API_URL}/unidades/disponibles`, { headers })
      ]);
      
      setReportes(resReportes.data);
      setUnidades(resUnidades.data);
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

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '24px', height: '80vh' }}>
      
      {/* Sidebar - Panel de Control */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }}>
        
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="gradient-text" style={{ margin: 0 }}>Reportes Pendientes ({reportes.length})</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reportes.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No hay reportes pendientes.</p>
            ) : reportesVisibles.map(rep => (
              <div key={rep.id} style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid var(--primary)' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{rep.tipoIncidente}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  {new Date(rep.timestamp).toLocaleTimeString()}
                </div>
                {rep.descripcion && <div style={{ fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>"{rep.descripcion}"</div>}
              </div>
            ))}
          </div>
          
          <Link 
            to="/reportes-pendientes"
            className="btn-secondary" 
            style={{ width: '100%', marginTop: '16px', padding: '10px', fontSize: '0.9rem', textDecoration: 'none', display: 'block', textAlign: 'center' }}
          >
            Abrir Bandeja de Reportes...
          </Link>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 className="gradient-text" style={{ marginBottom: '16px', color: 'var(--success)' }}>Unidades Libres ({unidades.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {unidades.map(u => (
              <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', fontSize: '0.9rem' }}>
                <span style={{ fontWeight: 600 }}>{u.codigo}</span>
                <span style={{ color: 'var(--text-muted)' }}>{u.tipo}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Main Map */}
      <div className="glass-panel" style={{ height: '100%', overflow: 'hidden' }}>
        <MapContainer center={[-12.046374, -77.029851]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          
          {reportes.map(rep => (
            <Marker key={rep.id} position={[rep.latitud, rep.longitud]} icon={reportIcon}>
              <Popup>
                <div style={{ color: 'black' }}>
                  <strong>{rep.tipoIncidente}</strong><br/>
                  Reporte Pendiente
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
