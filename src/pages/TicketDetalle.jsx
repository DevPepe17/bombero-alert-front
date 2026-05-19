import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { Save, ChevronDown, ChevronUp, CheckCircle, Clock, XCircle } from 'lucide-react';
import L from 'leaflet';

const API_URL = import.meta.env.VITE_API_URL || 'https://bombero-alert-api.onrender.com/api';

const customIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const ESTADO_CONFIG = {
  EN_COLA:     { label: 'En Cola',   color: '#FF9500', bg: 'rgba(255,149,0,0.15)' },
  ACTIVO:      { label: 'Activo',    color: '#30D158', bg: 'rgba(48,209,88,0.15)' },
  PENDIENTE:   { label: 'Pendiente', color: '#0A84FF', bg: 'rgba(10,132,255,0.15)' },
  RESUELTO:    { label: 'Resuelto',  color: '#34C759', bg: 'rgba(52,199,89,0.15)' },
  CANCELADO:   { label: 'Cancelado', color: '#FF3B30', bg: 'rgba(255,59,48,0.15)' },
  // Legacy
  RECIBIDO:    { label: 'En Cola',   color: '#FF9500', bg: 'rgba(255,149,0,0.15)' },
  EN_CAMINO:   { label: 'Activo',    color: '#30D158', bg: 'rgba(48,209,88,0.15)' },
  ATENDIDO:    { label: 'Resuelto',  color: '#34C759', bg: 'rgba(52,199,89,0.15)' },
  FALSA_ALARMA:{ label: 'Cancelado', color: '#FF3B30', bg: 'rgba(255,59,48,0.15)' },
};

export default function TicketDetalle({ auth }) {
  const { id } = useParams();
  const [reporte, setReporte] = useState(null);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [estadoActual, setEstadoActual] = useState('EN_COLA');
  const [secInfo, setSecInfo] = useState(true);
  const [secDespacho, setSecDespacho] = useState(true);

  const [formData, setFormData] = useState({
    nombre: 'Ciudadano Anónimo',
    telefono: 'No registrado',
    correo: 'No registrado',
    descripcion: '',
    categorizacion: '',
    prioridad: 'P1',
    fuente: 'Aplicación Móvil',
    unidadAsignada: '',
    motivoResolucion: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${auth.token}` };
        const [resReportes, resUnidades] = await Promise.all([
          axios.get(`${API_URL}/reportes/pendientes`, { headers }),
          axios.get(`${API_URL}/unidades/disponibles`, { headers })
        ]);
        const found = resReportes.data.find(r => r.id.toString() === id);
        if (found) {
          setReporte(found);
          setEstadoActual(found.estado || 'EN_COLA');
          setFormData(prev => ({
            ...prev,
            nombre: found.nombreCiudadano || 'Ciudadano Anónimo',
            telefono: found.telefonoCiudadano || 'No registrado',
            correo: found.correoCiudadano || 'No registrado',
            descripcion: found.descripcion || '',
            prioridad: found.prioridad || 'P1',
            motivoResolucion: found.motivoResolucion || '',
            categorizacion: found.tipoIncidente
          }));
        }
        setUnidades(resUnidades.data);
      } catch (err) {
        console.error('Error cargando ticket:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, auth.token]);

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      const headers = { Authorization: `Bearer ${auth.token}` };
      await axios.put(`${API_URL}/reportes/${id}`, {
        descripcion: formData.descripcion,
        prioridad: formData.prioridad,
        motivoResolucion: formData.motivoResolucion,
        unidadAsignada: formData.unidadAsignada
      }, { headers });
      alert('Ticket guardado correctamente.');
    } catch (err) {
      alert('Error al guardar el ticket.');
    } finally {
      setGuardando(false);
    }
  };

  const handleCambiarEstado = async (nuevoEstado) => {
    try {
      const headers = { Authorization: `Bearer ${auth.token}` };
      await axios.put(`${API_URL}/reportes/${id}`, { estado: nuevoEstado }, { headers });
      setEstadoActual(nuevoEstado);
      if (nuevoEstado === 'RESUELTO' || nuevoEstado === 'CANCELADO') {
        alert(`Ticket marcado como "${ESTADO_CONFIG[nuevoEstado].label}". Se cerrará esta pestaña.`);
        window.close();
      }
    } catch (err) {
      alert('Error al cambiar el estado del ticket.');
    }
  };

  if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '100px' }}>Cargando ticket...</div>;
  if (!reporte) return <div style={{ color: 'white', textAlign: 'center', marginTop: '100px' }}>Ticket No Encontrado</div>;

  const estadoConf = ESTADO_CONFIG[estadoActual] || ESTADO_CONFIG['EN_COLA'];

  const headerStyle = {
    background: 'rgba(255,255,255,0.05)', padding: '12px 20px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    cursor: 'pointer', borderTopLeftRadius: '8px', borderTopRightRadius: '8px',
    borderBottom: '1px solid var(--surface-border)', fontWeight: 'bold', color: 'var(--primary)'
  };
  const sectionStyle = {
    background: 'rgba(0,0,0,0.2)', border: '1px solid var(--surface-border)',
    borderRadius: '8px', marginBottom: '20px'
  };
  const labelStyle = { display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' };
  const reqStyle = { color: 'var(--primary)' };

  const ActividadBtn = ({ label, estado, icon, rgb }) => (
    <button
      onClick={() => handleCambiarEstado(estado)}
      disabled={estadoActual === estado}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        width: '100%', padding: '14px 16px', borderRadius: '8px',
        background: estadoActual === estado ? `rgba(${rgb},0.2)` : 'rgba(255,255,255,0.04)',
        border: `1px solid ${estadoActual === estado ? `rgba(${rgb},0.8)` : 'var(--surface-border)'}`,
        color: estadoActual === estado ? `rgb(${rgb})` : 'rgba(255,255,255,0.7)',
        cursor: estadoActual === estado ? 'default' : 'pointer',
        fontWeight: 600, fontSize: '0.92rem', transition: 'all 0.2s',
      }}
    >
      {icon} {label}
      {estadoActual === estado && (
        <span style={{ marginLeft: 'auto', fontSize: '0.72rem', opacity: 0.8 }}>● ACTUAL</span>
      )}
    </button>
  );

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px', background: 'var(--bg-color)', minHeight: '100vh' }}>

      {/* ── Top Bar ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--surface-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--primary)', color: 'white', padding: '8px 12px', borderRadius: '4px', fontWeight: 'bold' }}>
            TICKET #{reporte.id}
          </div>
          <span style={{ fontSize: '1.1rem', color: 'white', fontWeight: 500 }}>{reporte.tipoIncidente}</span>
          <span style={{ padding: '6px 16px', borderRadius: '20px', fontWeight: 700, fontSize: '0.85rem', background: estadoConf.bg, color: estadoConf.color }}>
            {estadoConf.label}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" onClick={() => window.close()} style={{ borderRadius: '4px', padding: '8px 24px' }}>
            Cerrar
          </button>
          <button className="btn-primary" onClick={handleGuardar} disabled={guardando}
            style={{ borderRadius: '4px', padding: '8px 24px', background: 'var(--success)' }}>
            <Save size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            {guardando ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>

        {/* ── Columna Izquierda ── */}
        <div>
          {/* Sección Info */}
          <div style={sectionStyle}>
            <div style={headerStyle} onClick={() => setSecInfo(!secInfo)}>
              <span>Información del ticket</span>
              {secInfo ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            {secInfo && (
              <div style={{ padding: '24px' }}>
                {/* Solicitante */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.08)', padding: '5px 14px', borderRadius: '4px', marginBottom: '14px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    <span style={reqStyle}>*</span> Solicitante
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={labelStyle}><span style={reqStyle}>*</span> Nombre Completo</label>
                      <input className="input-control" style={{ borderRadius: '4px', padding: '8px 12px', opacity: 0.6 }} value={formData.nombre} disabled />
                    </div>
                    <div>
                      <label style={labelStyle}>Correo electrónico</label>
                      <input className="input-control" style={{ borderRadius: '4px', padding: '8px 12px', opacity: 0.6 }} value={formData.correo} disabled />
                    </div>
                    <div>
                      <label style={labelStyle}>Teléfono de Contacto</label>
                      <input className="input-control" style={{ borderRadius: '4px', padding: '8px 12px', opacity: 0.6 }} value={formData.telefono} disabled />
                    </div>
                    <div>
                      <label style={labelStyle}>Fecha de Registro</label>
                      <input className="input-control" style={{ borderRadius: '4px', padding: '8px 12px', opacity: 0.6 }} value={new Date(reporte.timestamp).toLocaleString()} disabled />
                    </div>
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--surface-border)', margin: '20px 0' }} />

                {/* Acerca del Incidente */}
                <div>
                  <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.08)', padding: '5px 14px', borderRadius: '4px', marginBottom: '14px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    <span style={reqStyle}>*</span> Acerca del Incidente
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}><span style={reqStyle}>*</span> Descripción Reportada</label>
                        <textarea className="input-control" rows="4" style={{ borderRadius: '4px', padding: '8px 12px', resize: 'vertical' }}
                          value={formData.descripcion} onChange={e => setFormData({ ...formData, descripcion: e.target.value })} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={labelStyle}>Categorización</label>
                          <select className="input-control" style={{ borderRadius: '4px', padding: '8px 12px' }}
                            value={formData.categorizacion} onChange={e => setFormData({ ...formData, categorizacion: e.target.value })}>
                            <option value="INCENDIO">INCENDIO</option>
                            <option value="RESCATE">RESCATE</option>
                            <option value="MEDICO">MÉDICA</option>
                            <option value="OTROS">OTROS</option>
                          </select>
                        </div>
                        <div>
                          <label style={labelStyle}>Prioridad</label>
                          <select className="input-control" style={{ borderRadius: '4px', padding: '8px 12px' }}
                            value={formData.prioridad} onChange={e => setFormData({ ...formData, prioridad: e.target.value })}>
                            <option value="P1">P1 - Alta</option>
                            <option value="P2">P2 - Media</option>
                            <option value="P3">P3 - Baja</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Ubicación GPS (Verificada)</label>
                      <div style={{ height: '160px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--surface-border)', marginBottom: '6px' }}>
                        <MapContainer center={[reporte.latitud, reporte.longitud]} zoom={15} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                          <Marker position={[reporte.latitud, reporte.longitud]} icon={customIcon} />
                        </MapContainer>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                        Lat: {reporte.latitud}, Lng: {reporte.longitud}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sección Despacho */}
          <div style={sectionStyle}>
            <div style={headerStyle} onClick={() => setSecDespacho(!secDespacho)}>
              <span>Información de Despacho</span>
              {secDespacho ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            {secDespacho && (
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Asignar Unidad Disponible</label>
                    <select className="input-control" style={{ borderRadius: '4px', padding: '8px 12px', border: '1px solid var(--success)', background: 'rgba(52,199,89,0.05)' }}
                      value={formData.unidadAsignada} onChange={e => setFormData({ ...formData, unidadAsignada: e.target.value })}>
                      <option value="">-- Seleccionar Unidad (Opcional) --</option>
                      {unidades.map(u => <option key={u.id} value={u.codigo}>{u.codigo} ({u.tipo})</option>)}
                    </select>
                    {unidades.length === 0 && <span style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>No hay unidades libres.</span>}
                  </div>
                  <div>
                    <label style={labelStyle}>Motivo de Resolución / Notas</label>
                    <input className="input-control" style={{ borderRadius: '4px', padding: '8px 12px' }}
                      placeholder="Ej. Falsa alarma, despacho por cercanía..."
                      value={formData.motivoResolucion} onChange={e => setFormData({ ...formData, motivoResolucion: e.target.value })} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Columna Derecha: Actividades ── */}
        <div style={{ position: 'sticky', top: '20px' }}>
          <div style={{ ...sectionStyle, marginBottom: 0 }}>
            <div style={{ ...headerStyle, cursor: 'default' }}>
              <span>Actividades</span>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

              {/* Estado actual badge */}
              <div style={{ padding: '12px', borderRadius: '8px', background: estadoConf.bg, border: `1px solid ${estadoConf.color}`, textAlign: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Estado actual</span>
                <span style={{ color: estadoConf.color, fontWeight: 'bold', fontSize: '1.05rem' }}>
                  {estadoConf.label}
                </span>
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 8px 0' }}>
                {['EN_COLA', 'RECIBIDO'].includes(estadoActual)
                  ? 'Ticket recibido. Acepta para comenzar la atención o cancélalo.'
                  : ['ACTIVO', 'EN_CAMINO'].includes(estadoActual)
                  ? 'Ticket activo. Actualiza el estado según el avance.'
                  : 'Ticket en revisión. Acéptalo nuevamente o ciérralo.'}
              </p>

              {/* ── EN_COLA / RECIBIDO (legacy): solo Aceptar y Cancelar ── */}
              {['EN_COLA', 'RECIBIDO', 'PENDIENTE'].includes(estadoActual) && (
                <>
                  <ActividadBtn label="Aceptar Ticket" estado="ACTIVO" icon={<CheckCircle size={18} />} rgb="48,209,88" />
                  <ActividadBtn label="Cancelar Ticket" estado="CANCELADO" icon={<XCircle size={18} />} rgb="255,59,48" />
                </>
              )}

              {/* ── ACTIVO / EN_CAMINO (legacy): Pendiente, Resuelto, Cancelar ── */}
              {['ACTIVO', 'EN_CAMINO', 'ATENDIDO'].includes(estadoActual) && (
                <>
                  <ActividadBtn label="Poner en Pendiente" estado="PENDIENTE" icon={<Clock size={18} />} rgb="10,132,255" />
                  <ActividadBtn label="Marcar como Resuelto" estado="RESUELTO" icon={<CheckCircle size={18} />} rgb="52,199,89" />
                  <ActividadBtn label="Cancelar Ticket" estado="CANCELADO" icon={<XCircle size={18} />} rgb="255,59,48" />
                </>
              )}

              {/* ── Terminal: ya no hay acciones disponibles ── */}
              {['RESUELTO', 'CANCELADO', 'FALSA_ALARMA'].includes(estadoActual) && (
                <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--surface-border)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Este ticket está cerrado y no admite más acciones.
                  </span>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
