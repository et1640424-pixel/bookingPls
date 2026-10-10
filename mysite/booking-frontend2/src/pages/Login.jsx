import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(form.email.trim(), form.password);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="auth" onSubmit={submit}>
      <div>
        <h1>С возвращением</h1>
        <p className="muted">Войдите, чтобы бронировать номера и управлять профилем.</p>
      </div>

      <label className="field">
        <span>Email</span>
        <input type="email" value={form.email} onChange={set('email')} autoComplete="email" required autoFocus />
      </label>

      <label className="field">
        <span>Пароль</span>
        <div className="field-wrap">
          <input
            type={show ? 'text' : 'password'}
            value={form.password}
            onChange={set('password')}
            autoComplete="current-password"
            required
          />
          <button type="button" className="field-btn" onClick={() => setShow(!show)}>
            {show ? 'Скрыть' : 'Показать'}
          </button>
        </div>
      </label>

      {error && <p className="error">{error}</p>}
      <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Входим…' : 'Войти'}</button>
      <p className="muted center">
        Нет аккаунта? <Link to="/register" className="link">Зарегистрироваться</Link>
      </p>
    </form>
  );
}
