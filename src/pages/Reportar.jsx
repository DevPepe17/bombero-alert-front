import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Flame, LifeBuoy, PlusSquare, AlertTriangle, MapPin, Camera, Send } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://bombero-alert-api.onrender.com/api';

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return position === null ? null : <Marker position={position} />;
}

export default function Reportar({ auth }) {
  const [tipoIncidente, setTipoIncidente] = useState('INCENDIO');
  const [descripcion, setDescripcion] = useState('');
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setPosition({ lat: -12.046374, lng: -77.029851 }) // Default Lima
      );
    } else {
      setPosition({ lat: -12.046374, lng: -77.029851 });
    }
  }, []);

  const handleSubmit = async () => {
    if (!position) return alert("Por favor selecciona tu ubicación en el mapa");
    if (!tipoIncidente) return alert("Por favor selecciona el tipo de emergencia");
    
    setLoading(true);
    try {
      await axios.post(`${API_URL}/reportes`, {
        tipoIncidente,
        descripcion,
        latitud: position.lat,
        longitud: position.lng
      }, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setSuccess(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Error al enviar reporte');
    } finally {
      setLoading(false);
    }
  };

  const getUbicacionText = () => {
    if (!position) return "Buscando tu ubicación...";
    return `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`;
  };

  if (success) {
    return (
      <div className="glass-panel animate-fade-in" style={{ padding: '60px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
        <div style={{ fontSize: '72px', marginBottom: '24px' }}>🚨</div>
        <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '16px' }}>¡Emergencia Reportada!</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '40px', lineHeight: '1.6' }}>
          La central ha recibido tu alerta. Las unidades están siendo despachadas a tu ubicación exacta. Por favor, mantén la calma y aléjate de la zona de peligro.
        </p>
        <button className="btn-secondary" onClick={() => { setSuccess(false); setDescripcion(''); }} style={{ padding: '14px 32px' }}>
          Enviar un nuevo reporte
        </button>
      </div>
    );
  }

  const tipos = [
    { id: 'INCENDIO', icon: <Flame size={28} />, label: 'INCENDIO' },
    { id: 'RESCATE', icon: <LifeBuoy size={28} />, label: 'RESCATE' },
    { id: 'MEDICO', icon: <PlusSquare size={28} />, label: 'MÉDICO' },
    { id: 'OTROS', icon: <AlertTriangle size={28} />, label: 'OTROS' },
  ];

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '32px' }}>
        <h2 className="gradient-text" style={{ fontSize: '2.2rem', marginBottom: '8px' }}>Reportar Emergencia</h2>
        <p style={{ color: 'var(--text-muted)' }}>Completa la información para despachar ayuda inmediatamente.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '32px' }}>
        
        {/* Lado Izquierdo: Formulario */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              TIPO DE EMERGENCIA
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {tipos.map(tipo => (
                <button
                  key={tipo.id}
                  onClick={() => setTipoIncidente(tipo.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    padding: '24px 16px',
                    borderRadius: '16px',
                    background: tipoIncidente === tipo.id ? 'rgba(255,59,48,0.1)' : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${tipoIncidente === tipo.id ? 'var(--primary)' : 'var(--surface-border)'}`,
                    color: tipoIncidente === tipo.id ? 'var(--primary)' : 'var(--text-main)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {tipo.icon}
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{tipo.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              UBICACIÓN DEL INCIDENTE
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div className="input-control" style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, color: 'var(--text-muted)', cursor: 'not-allowed' }}>
                <MapPin size={18} color="var(--primary)" />
                {getUbicacionText()}
              </div>
              <button className="btn-primary" style={{ padding: '0 20px', borderRadius: '12px' }} onClick={() => {
                if(navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(pos => setPosition({lat: pos.coords.latitude, lng: pos.coords.longitude}));
                }
              }} title="Centrar en mi ubicación GPS">
                <MapPin size={20} />
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              DESCRIPCIÓN
            </label>
            <textarea 
              className="input-control" 
              rows="4" 
              placeholder="Detalles sobre el incidente (Heridos, estado actual, personas atrapadas...)"
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              style={{ resize: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '36px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              EVIDENCIA FOTOGRÁFICA
            </label>
            <button className="btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px', borderStyle: 'dashed', borderWidth: '2px', color: 'var(--primary)', borderColor: 'var(--primary)' }}>
              <Camera size={20} />
              <span style={{ fontWeight: 600 }}>TOMAR FOTOGRAFÍA</span>
            </button>
          </div>

          <button className="btn-primary" style={{ width: '100%', padding: '20px', fontSize: '1.1rem', borderRadius: '14px', letterSpacing: '0.05em' }} onClick={handleSubmit} disabled={loading}>
            {loading ? 'ENVIANDO ALERTA...' : (
              <>
                <Send size={22} style={{ marginRight: '8px' }} />
                ENVIAR REPORTE
              </>
            )}
          </button>
          
        </div>

        {/* Lado Derecho: Mapa Interactivo */}
        <div className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--surface-border)', background: 'rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Mapa de Ubicación Exacta</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>Puedes hacer clic en el mapa para ajustar la posición manualmente</p>
          </div>
          <div style={{ flex: 1, minHeight: '500px', width: '100%' }}>
            {position && (
              <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                <LocationPicker position={position} setPosition={setPosition} />
              </MapContainer>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
