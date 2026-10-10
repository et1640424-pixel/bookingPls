import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', phone_number: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        phone_number: form.phone_number.replace(/[\s()-]/g, ''),
      });
      navigate('/profile', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="auth" onSubmit={submit}>
      <div>
        <h1>Создать аккаунт</h1>
        <p className="muted">Это займёт меньше минуты. Профиль можно дополнить позже.</p>
      </div>

      <label className="field">
        <span>Имя пользователя</span>
        <input value={form.username} onChange={set('username')} autoComplete="username" required autoFocus />
      </label>

      <label className="field">
        <span>Email</span>
        <input type="email" value={form.email} onChange={set('email')} autoComplete="email" required />
      </label>

      <label className="field">
        <span>Телефон</span>
        <input
          type="tel"
          placeholder="+996 700 123 456"
          value={form.phone_number}
          onChange={set('phone_number')}
          autoComplete="tel"
          required
        />
      </label>

      <label className="field">
        <span>Пароль</span>
        <div className="field-wrap">
          <input
            type={show ? 'text' : 'password'}
            minLength={6}
            value={form.password}
            onChange={set('password')}
            autoComplete="new-password"
            required
          />
          <button type="button" className="field-btn" onClick={() => setShow(!show)}>
            {show ? 'Скрыть' : 'Показать'}
          </button>
        </div>
      </label>

      {error && <p className="error">{error}</p>}
      <button className="btn btn-primary btn-block" disabled={busy}>
        {busy ? 'Создаём…' : 'Создать аккаунт'}
      </button>
      <p className="muted center">
        Уже есть аккаунт? <Link to="/login" className="link">Войти</Link>
      </p>
    </form>
  );
}
