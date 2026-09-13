import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.email, form.name, form.password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={submit}>
        <h2>Регистрация</h2>
        {error && <div className="error">{error}</div>}
        <label>Имя
          <input name="name" value={form.name} onChange={change} required />
        </label>
        <label>Email
          <input name="email" type="email" value={form.email} onChange={change} required />
        </label>
        <label>Пароль (мин. 6 символов)
          <input name="password" type="password" value={form.password} onChange={change} required minLength={6} />
        </label>
        <button className="btn" disabled={loading}>{loading ? '...' : 'Создать аккаунт'}</button>
        <p className="muted">Уже есть аккаунт? <Link to="/login">Войти</Link></p>
      </form>
    </div>
  );
}