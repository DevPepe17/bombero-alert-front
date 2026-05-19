import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import {
  AlertTriangle, CheckCircle, Clock, XCircle, Inbox,
  Truck, TrendingUp, Users, RefreshCw, Activity
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://bombero-alert-api.onrender.com/api';

const ESTADO_COLOR = {
  EN_COLA:   '#FF9500',
  ACTIVO:    '#30D158',
  PENDIENTE: '#0A84FF',
  RESUELTO:  '#34C759',
  CANCELADO: '#FF3B30',
};

const TIPO_COLOR = ['#FF9500', '#30D158', '#0A84FF', '#FF3B30', '#BF5AF2', '#64D2FF'];

const CUSTOM_TOOLTIP_STYLE = {
  background: '#1c1c1e',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  color: '#fff',
  fontSize: '0.85rem',
  padding: '10px 14px',
};

function StatCard({ icon, label, value, color, subtitle }) {
  return (
    <div className="glass-panel" style={{
      padding: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      borderLeft: `4px solid ${color}`,
      transition: 'transform 0.2s',
    }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{
        width: '52px', height: '52px', borderRadius: '14px',
        background: `${color}22`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <div style={{ fontSize: '2rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>{label}</div>
        {subtitle && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{subtitle}</div>}
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={CUSTOM_TOOLTIP_STYLE}>
      <strong>{label}</strong>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
}

export default function AdminDashboard({ auth }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setStats(res.data);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh cada 30s
    return () => clearInterval(interval);
  }, [auth.token]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
        <Activity size={40} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-muted)' }}>Cargando estadísticas del sistema...</p>
      </div>
    );
  }

  if (!stats) return <p style={{ color: 'var(--text-muted)' }}>No se pudieron cargar las estadísticas.</p>;

  // Datos para gráficos
  const estadosData = [
    { name: 'En Cola',   value: stats.enCola,    color: ESTADO_COLOR.EN_COLA },
    { name: 'Activos',   value: stats.activos,   color: ESTADO_COLOR.ACTIVO },
    { name: 'Pendiente', value: stats.pendientes, color: ESTADO_COLOR.PENDIENTE },
    { name: 'Resueltos', value: stats.resueltos,  color: ESTADO_COLOR.RESUELTO },
    { name: 'Cancelados',value: stats.cancelados, color: ESTADO_COLOR.CANCELADO },
  ].filter(d => d.value > 0);

  const tipoData = Object.entries(stats.porTipoIncidente || {}).map(([name, value]) => ({ name, value }));
  const prioridadData = Object.entries(stats.porPrioridad || {}).map(([name, value]) => ({ name, value }));

  const tasaResolucion = stats.totalReportes > 0
    ? ((stats.resueltos / stats.totalReportes) * 100).toFixed(1)
    : 0;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '36px' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '6px' }}>
            Panel de Administración
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Métricas en tiempo real del sistema de emergencias
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <button
            onClick={fetchStats}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
          >
            <RefreshCw size={16} />
            Actualizar
          </button>
          {lastUpdate && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Última actualización: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <StatCard icon={<TrendingUp size={26} />}  label="Total Reportes"    value={stats.totalReportes} color="#BF5AF2" subtitle={`${stats.reportesHoy} hoy`} />
        <StatCard icon={<Inbox size={26} />}        label="En Cola"          value={stats.enCola}       color={ESTADO_COLOR.EN_COLA} />
        <StatCard icon={<Activity size={26} />}     label="Activos"          value={stats.activos}      color={ESTADO_COLOR.ACTIVO} />
        <StatCard icon={<Clock size={26} />}        label="Pendientes"       value={stats.pendientes}   color={ESTADO_COLOR.PENDIENTE} />
        <StatCard icon={<CheckCircle size={26} />}  label="Resueltos"        value={stats.resueltos}    color={ESTADO_COLOR.RESUELTO} subtitle={`${tasaResolucion}% tasa resolución`} />
        <StatCard icon={<XCircle size={26} />}      label="Cancelados"       value={stats.cancelados}   color={ESTADO_COLOR.CANCELADO} />
        <StatCard icon={<Truck size={26} />}        label="Unidades Libres"  value={`${stats.unidadesDisponibles}/${stats.unidadesTotales}`} color="#64D2FF" subtitle="disponibles" />
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>

        {/* Gráfico por Tipo de Incidente */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '24px', fontWeight: 700 }}>
            <AlertTriangle size={18} style={{ marginRight: '8px', color: '#FF9500', verticalAlign: 'middle' }} />
            Reportes por Tipo de Incidente
          </h3>
          {tipoData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Sin datos aún</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={tipoData} margin={{ left: -20 }}>
                <XAxis dataKey="name" tick={{ fill: '#8e8e93', fontSize: 12 }} />
                <YAxis tick={{ fill: '#8e8e93', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Reportes" radius={[6, 6, 0, 0]}>
                  {tipoData.map((_, i) => (
                    <Cell key={i} fill={TIPO_COLOR[i % TIPO_COLOR.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Gráfico por Estado (Pie) */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '24px', fontWeight: 700 }}>
            <Activity size={18} style={{ marginRight: '8px', color: '#30D158', verticalAlign: 'middle' }} />
            Distribución por Estado
          </h3>
          {estadosData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Sin datos aún</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={estadosData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {estadosData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => <span style={{ color: '#ccc', fontSize: '0.82rem' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Prioridad Bar + Últimos reportes ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: '24px' }}>

        {/* Gráfico por Prioridad */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '24px', fontWeight: 700 }}>
            Distribución por Prioridad
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={prioridadData} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" tick={{ fill: '#8e8e93', fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#ccc', fontSize: 11 }} width={90} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Tickets" radius={[0, 6, 6, 0]}>
                <Cell fill="#FF3B30" />
                <Cell fill="#FF9500" />
                <Cell fill="#34C759" />
                <Cell fill="#636366" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Últimos 5 reportes */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', fontWeight: 700 }}>
            <Users size={18} style={{ marginRight: '8px', color: '#BF5AF2', verticalAlign: 'middle' }} />
            Actividad Reciente
          </h3>
          {stats.reportesRecientes?.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>No hay reportes recientes.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.reportesRecientes?.map(rep => {
                const color = ESTADO_COLOR[rep.estado] || '#636366';
                return (
                  <div key={rep.id} style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '14px 16px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{rep.tipoIncidente}</span>
                        <span style={{ fontSize: '0.72rem', padding: '2px 8px', background: `${color}22`, color, borderRadius: '8px', fontWeight: 700, flexShrink: 0 }}>
                          {rep.estado?.replace('_', ' ')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                          {rep.nombreCiudadano}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
                          {rep.timestamp ? new Date(rep.timestamp).toLocaleTimeString() : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
