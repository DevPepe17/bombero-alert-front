import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

// ── Páginas Ciudadano ────────────────────────────────────────────────────────
import Login from './pages/Login';
import Registro from './pages/Registro';
import Reportar from './pages/Reportar';
import MisReportes from './pages/MisReportes';

// ── Páginas Operador ─────────────────────────────────────────────────────────
import Dashboard from './pages/Dashboard';
import ReportesOperador from './pages/ReportesOperador';
import TicketDetalle from './pages/TicketDetalle';

// ── Páginas Administrador ────────────────────────────────────────────────────
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem('auth');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (data) => {
    setAuth(data);
    localStorage.setItem('auth', JSON.stringify(data));
  };

  const logout = () => {
    setAuth(null);
    localStorage.removeItem('auth');
  };

  // ── Interceptor global: auto-logout si el token expira o el usuario fue eliminado ──
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          logout();
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  // ── Redirección inicial según rol ─────────────────────────────────────────
  const homeByRole = (rol) => {
    if (rol === 'CIUDADANO')     return '/reportar';
    if (rol === 'OPERADOR')      return '/dashboard';
    if (rol === 'ADMINISTRADOR') return '/admin';
    return '/login';
  };

  return (
    <Router>
      <div className="app-container">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        {auth && (
          <header className="app-header glass-panel" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
            <div className="container header-content">
              <div className="brand">
                <div className="brand-icon">B</div>
                <h3>Emergencias <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>| Perú</span></h3>
              </div>

              <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>

                {/* Nav Ciudadano */}
                {auth.rol === 'CIUDADANO' && (
                  <nav style={{ display: 'flex', gap: '16px' }}>
                    <Link to="/reportar"    style={{ color: 'white', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Nuevo Reporte</Link>
                    <Link to="/mis-reportes" style={{ color: 'white', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Mis Reportes</Link>
                  </nav>
                )}

                {/* Nav Operador */}
                {auth.rol === 'OPERADOR' && (
                  <nav style={{ display: 'flex', gap: '16px' }}>
                    <Link to="/dashboard"           style={{ color: 'white', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Monitor de Mapa</Link>
                    <Link to="/reportes-pendientes" style={{ color: 'white', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Bandeja de Reportes</Link>
                  </nav>
                )}

                {/* Nav Administrador */}
                {auth.rol === 'ADMINISTRADOR' && (
                  <nav style={{ display: 'flex', gap: '16px' }}>
                    <Link to="/admin" style={{ color: 'white', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>📊 Panel Admin</Link>
                  </nav>
                )}

                {/* Usuario + Salir */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '24px' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {auth.nombreCompleto} <span style={{ color: auth.rol === 'ADMINISTRADOR' ? '#BF5AF2' : auth.rol === 'OPERADOR' ? '#30D158' : '#FF9500', fontWeight: 600 }}>({auth.rol})</span>
                  </span>
                  <button className="btn-secondary" onClick={logout} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    Salir
                  </button>
                </div>

              </div>
            </div>
          </header>
        )}

        {/* ── Rutas ──────────────────────────────────────────────────────── */}
        <main className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
          <Routes>

            {/* Públicas */}
            <Route path="/login"    element={!auth ? <Login onLogin={login} />    : <Navigate to={homeByRole(auth.rol)} />} />
            <Route path="/registro" element={!auth ? <Registro onLogin={login} /> : <Navigate to={homeByRole(auth.rol)} />} />

            {/* ── Ciudadano ── */}
            <Route path="/reportar"    element={auth?.rol === 'CIUDADANO' ? <Reportar auth={auth} />    : <Navigate to="/login" />} />
            <Route path="/mis-reportes" element={auth?.rol === 'CIUDADANO' ? <MisReportes auth={auth} /> : <Navigate to="/login" />} />

            {/* ── Operador ── */}
            <Route path="/dashboard"           element={auth?.rol === 'OPERADOR' ? <Dashboard auth={auth} />         : <Navigate to="/login" />} />
            <Route path="/reportes-pendientes" element={auth?.rol === 'OPERADOR' ? <ReportesOperador auth={auth} />   : <Navigate to="/login" />} />
            <Route path="/ticket/:id"          element={auth?.rol === 'OPERADOR' ? <TicketDetalle auth={auth} />      : <Navigate to="/login" />} />

            {/* ── Administrador ── */}
            <Route path="/admin" element={auth?.rol === 'ADMINISTRADOR' ? <AdminDashboard auth={auth} /> : <Navigate to="/login" />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to={auth ? homeByRole(auth.rol) : '/login'} />} />

          </Routes>
        </main>

      </div>
    </Router>
  );
}

export default App;
