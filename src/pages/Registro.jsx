import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://bombero-alert-api.onrender.com/api';

export default function Registro({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    dni: '',
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    telefono: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Llamada al endpoint de registro
      const response = await axios.post(`${API_URL}/auth/registro`, formData);
      // El backend devuelve el mismo formato de AuthResponse (con token y rol)
      onLogin(response.data);
      navigate('/reportar');
    } catch (err) {
      if (err.response?.data?.validationErrors) {
        const errors = err.response.data.validationErrors;
        const firstError = Object.values(errors)[0];
        setError(firstError);
      } else {
        setError(err.response?.data?.message || 'Error al registrar usuario');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="brand-icon" style={{ width: '56px', height: '56px', fontSize: '24px', margin: '0 auto 16px auto', borderRadius: '16px' }}>B</div>
          <h2 className="gradient-text" style={{ fontSize: '1.6rem', marginBottom: '8px' }}>Crear Cuenta de Ciudadano</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Únete a la red de reportes de emergencias</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(255, 59, 48, 0.1)', border: '1px solid var(--primary)', padding: '12px', borderRadius: '8px', color: 'var(--primary)', marginBottom: '20px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label>Nombres</label>
              <input type="text" name="nombre" className="input-control" value={formData.nombre} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Apellidos</label>
              <input type="text" name="apellido" className="input-control" value={formData.apellido} onChange={handleChange} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label>DNI (8 dígitos)</label>
              <input type="text" name="dni" className="input-control" value={formData.dni} onChange={handleChange} maxLength="8" required />
            </div>
            <div className="input-group">
              <label>Teléfono</label>
              <input type="text" name="telefono" className="input-control" value={formData.telefono} onChange={handleChange} required />
            </div>
          </div>

          <div className="input-group">
            <label>Correo Electrónico</label>
            <input type="email" name="email" className="input-control" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label>Contraseña</label>
            <input type="password" name="password" className="input-control" value={formData.password} onChange={handleChange} minLength="6" required />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '12px' }} disabled={loading}>
            {loading ? 'Registrando...' : 'Crear Cuenta y Entrar'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          ¿Ya tienes una cuenta? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>Ingresa aquí</Link>
        </div>
      </div>
    </div>
  );
}
