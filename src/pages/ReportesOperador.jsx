import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Info, MapPin, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://bombero-alert-api.onrender.com/api';

const PRIORITY_ORDER = { 'P1': 1, 'P2': 2, 'P3': 3 };
const PRIORITY_COLORS = {
  'P1': { bg: 'rgba(255, 59, 48, 0.2)', color: '#FF3B30', label: 'P1 - Alta', bar: '#FF3B30' },
  'P2': { bg: 'rgba(255, 149, 0, 0.2)', color: '#FF9500', label: 'P2 - Media', bar: '#FF9500' },
  'P3': { bg: 'rgba(52, 199, 89, 0.2)', color: '#34C759', label: 'P3 - Baja', bar: '#34C759' },
};

const ESTADO_BADGE = {
  EN_COLA:   { label: 'En Cola',   color: '#FF9500', bg: 'rgba(255,149,0,0.2)' },
  ACTIVO:    { label: 'Activo',    color: '#30D158', bg: 'rgba(48,209,88,0.2)' },
  PENDIENTE: { label: 'Pendiente', color: '#0A84FF', bg: 'rgba(10,132,255,0.2)' },
  RESUELTO:  { label: 'Resuelto',  color: '#34C759', bg: 'rgba(52,199,89,0.2)' },
  CANCELADO: { label: 'Cancelado', color: '#FF3B30', bg: 'rgba(255,59,48,0.2)' },
};

export default function ReportesOperador({ auth }) {
  const [reportes, setReportes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [filtroPrioridad, setFiltroPrioridad] = useState('TODAS');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportes = async () => {
      try {
        const response = await axios.get(`${API_URL}/reportes/pendientes`, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        setReportes(response.data);
      } catch (error) {
        console.error("Error al cargar reportes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReportes();
    const interval = setInterval(fetchReportes, 15000);
    return () => clearInterval(interval);
  }, [auth.token]);

  const filteredReportes = reportes
    .filter(rep => {
      const matchSearch = rep.tipoIncidente.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (rep.descripcion && rep.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchFiltro = filtroTipo === 'TODOS' || rep.tipoIncidente === filtroTipo;
      const matchPrioridad = filtroPrioridad === 'TODAS' || rep.prioridad === filtroPrioridad;
      const matchEstado = filtroEstado === 'TODOS' || rep.estado === filtroEstado;
      return matchSearch && matchFiltro && matchPrioridad && matchEstado;
    })
    .sort((a, b) => {
      // P1 arriba, P2 en medio, P3 abajo. Sin prioridad va al final.
      const pa = PRIORITY_ORDER[a.prioridad] ?? 99;
      const pb = PRIORITY_ORDER[b.prioridad] ?? 99;
      return pa - pb;
    });

  const tiposUnicos = ['TODOS', ...new Set(reportes.map(r => r.tipoIncidente))];

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="gradient-text" style={{ fontSize: '2.2rem', marginBottom: '8px' }}>Todos los Reportes Pendientes</h2>
          <p style={{ color: 'var(--text-muted)' }}>Gestión, búsqueda y asignación de unidades para emergencias en cola. Ordenados por prioridad.</p>
        </div>
        <Link to="/dashboard" className="btn-secondary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowLeft size={18} /> Volver al Monitor
        </Link>
      </div>

      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Row 1: Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
          <Search color="var(--text-muted)" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por tipo de incidente o palabras clave..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, outline: 'none', fontSize: '1rem' }}
          />
        </div>

        {/* Row 2: Tipo + Prioridad filters */}
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Tipo */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap' }}>Tipo:</span>
            {tiposUnicos.map(tipo => (
              <button 
                key={tipo}
                onClick={() => setFiltroTipo(tipo)}
                style={{
                  background: filtroTipo === tipo ? 'rgba(255, 59, 48, 0.2)' : 'rgba(255,255,255,0.05)',
                  color: filtroTipo === tipo ? 'var(--primary)' : 'var(--text-muted)',
                  border: `1px solid ${filtroTipo === tipo ? 'var(--primary)' : 'var(--surface-border)'}`,
                  padding: '6px 14px', borderRadius: '20px', cursor: 'pointer',
                  fontWeight: 600, fontSize: '0.8rem', transition: 'all 0.2s'
                }}
              >
                {tipo}
              </button>
            ))}
          </div>

          <div style={{ width: '1px', height: '24px', background: 'var(--surface-border)' }} />

          {/* Prioridad */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap' }}>Prioridad:</span>
            {['TODAS', 'P1', 'P2', 'P3'].map(p => {
              const pConfig = p !== 'TODAS' ? PRIORITY_COLORS[p] : null;
              const isActive = filtroPrioridad === p;
              return (
                <button
                  key={p}
                  onClick={() => setFiltroPrioridad(p)}
                  style={{
                    background: isActive ? (pConfig ? pConfig.bg : 'rgba(255,255,255,0.1)') : 'rgba(255,255,255,0.05)',
                    color: isActive ? (pConfig ? pConfig.color : 'white') : 'var(--text-muted)',
                    border: `1px solid ${isActive ? (pConfig ? pConfig.color : 'white') : 'var(--surface-border)'}`,
                    padding: '6px 14px', borderRadius: '20px', cursor: 'pointer',
                    fontWeight: 700, fontSize: '0.8rem', transition: 'all 0.2s'
                  }}
                >
                  {p === 'TODAS' ? 'Todas' : PRIORITY_COLORS[p].label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Estado filter */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', paddingTop: '4px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap' }}>Estado:</span>
          {[{ key: 'TODOS', label: 'Todos', color: 'white', bg: 'rgba(255,255,255,0.1)', border: 'rgba(255,255,255,0.3)' },
            ...Object.entries(ESTADO_BADGE).map(([key, v]) => ({ key, label: v.label, color: v.color, bg: v.bg, border: v.color }))
          ].map(({ key, label, color, bg, border }) => {
            const isActive = filtroEstado === key;
            return (
              <button
                key={key}
                onClick={() => setFiltroEstado(key)}
                style={{
                  background: isActive ? bg : 'rgba(255,255,255,0.04)',
                  color: isActive ? color : 'var(--text-muted)',
                  border: `1px solid ${isActive ? border : 'var(--surface-border)'}`,
                  padding: '6px 14px', borderRadius: '20px', cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.8rem', transition: 'all 0.2s'
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Cargando datos de la central...</p>
        ) : filteredReportes.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Info size={48} style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
            <p style={{ fontSize: '1.1rem' }}>No se encontraron reportes que coincidan con la búsqueda.</p>
          </div>
        ) : (
          filteredReportes.map(rep => {
            const pConfig = PRIORITY_COLORS[rep.prioridad];
            return (
              <div key={rep.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Top bar colored by priority */}
                <div style={{ height: '6px', background: pConfig ? pConfig.bar : 'var(--surface-border)', width: '100%' }} />
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'white' }}>{rep.tipoIncidente}</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {pConfig && (
                        <span style={{ fontSize: '0.75rem', padding: '4px 10px', background: pConfig.bg, color: pConfig.color, borderRadius: '12px', fontWeight: 'bold' }}>
                          {pConfig.label}
                        </span>
                      )}
                      {/* Badge de estado dinámico */}
                      {(() => {
                        const eConf = ESTADO_BADGE[rep.estado] || ESTADO_BADGE['EN_COLA'];
                        return (
                          <span style={{ fontSize: '0.75rem', padding: '4px 10px', background: eConf.bg, color: eConf.color, borderRadius: '12px', fontWeight: 'bold' }}>
                            {eConf.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} /> 
                    Lat: {rep.latitud.toFixed(4)}, Lng: {rep.longitud.toFixed(4)}
                  </div>

                  <p style={{ color: '#ccc', fontSize: '0.95rem', marginBottom: '24px', flex: 1, lineHeight: '1.5' }}>
                    {rep.descripcion ? `"${rep.descripcion}"` : 'Sin descripción proporcionada por el ciudadano.'}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--surface-border)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                      {new Date(rep.timestamp).toLocaleTimeString()}
                    </span>
                    <Link 
                      to={`/ticket/${rep.id}`} 
                      target="_blank"
                      className="btn-primary" 
                      style={{ padding: '8px 16px', fontSize: '0.85rem', textDecoration: 'none' }}
                    >
                      Atender y Asignar Unidad
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
