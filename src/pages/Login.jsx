import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://bombero-alert-api.onrender.com/api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@bomberos.pe');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      onLogin(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="brand-icon" style={{ width: '64px', height: '64px', fontSize: '28px', margin: '0 auto 16px auto', borderRadius: '16px' }}>B</div>
          <h2 className="gradient-text" style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Ingresar al Sistema</h2>
          <p style={{ color: 'var(--text-muted)' }}>Plataforma Central de Emergencias</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(255, 59, 48, 0.1)', border: '1px solid var(--primary)', padding: '12px', borderRadius: '8px', color: 'var(--primary)', marginBottom: '20px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Correo Electrónico</label>
            <input 
              type="email" 
              className="input-control" 
              placeholder="ejemplo@bomberos.pe"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              className="input-control" 
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '12px' }} disabled={loading}>
            {loading ? 'Verificando...' : 'Acceder'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          ¿Eres nuevo ciudadano? <Link to="/registro" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>Regístrate aquí</Link>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.80rem', color: 'var(--text-muted)', borderTop: '1px solid var(--surface-border)', paddingTop: '16px' }}>
          <p>Cuentas operativas de prueba:</p>
          <p>Admin: admin@bomberos.pe / admin123</p>
          <p>Operador: operador1@bomberos.pe / operador123</p>
        </div>
      </div>
    </div>
  );
}
